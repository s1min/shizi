import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * WeChat login: code -> openid -> find/create user -> issue JWT
   */
  async wxLogin(code: string) {
    const appid = this.configService.get<string>('WX_APPID') || '';
    const secret = this.configService.get<string>('WX_APP_SECRET') || '';
    const wxLoginMock = this.configService.get<string>('WX_LOGIN_MOCK', 'false') === 'true';
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    let openid: string;
    const hasValidWechatConfig = this.hasValidWechatConfig(appid, secret);

    if (!hasValidWechatConfig) {
      if (!isProd && wxLoginMock) {
        openid = this.buildMockOpenid(code);
        this.logger.warn(`WX_LOGIN_MOCK enabled, using mock openid: ${openid}`);
      }
      else {
        throw new UnauthorizedException(
          'WeChat config is invalid, please set WX_APPID/WX_APP_SECRET or enable WX_LOGIN_MOCK in local dev.',
        );
      }
    }
    else {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

      try {
        const { data } = await axios.get(url);
        if (data.errcode) {
          this.logger.warn(`WeChat login failed: ${data.errcode} ${data.errmsg}`);
          throw new UnauthorizedException(`WeChat login failed: ${data.errmsg}`);
        }
        openid = data.openid;
      }
      catch (error) {
        if (error instanceof UnauthorizedException)
          throw error;
        this.logger.error('Failed to call WeChat jscode2session API', error);
        throw new UnauthorizedException('WeChat login service exception');
      }
    }

    // find/create user
    const user = await this.userService.findOrCreateByOpenid(openid);

    // issue JWT
    const payload = { sub: user._id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    return {
      token,
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  private hasValidWechatConfig(appid: string, secret: string): boolean {
    const appidInvalid = !appid || ['your-wx-appid', 'local-check-appid'].includes(appid);
    const secretInvalid = !secret || ['your-wx-app-secret', 'local-check-secret'].includes(secret);
    return !appidInvalid && !secretInvalid;
  }

  private buildMockOpenid(code: string): string {
    const cleaned = (code || '').replace(/[^a-zA-Z0-9]/g, '').slice(-16);
    const suffix = cleaned || Date.now().toString();
    return `mock_openid_${suffix}`;
  }

  /** parse '7d' / '24h' / '3600' into seconds */
  private parseExpiresIn(val: string): number {
    const match = val.match(/^(\d+)(d|h|m|s)?$/);
    if (!match)
      return 604800; // default 7 days
    const num = parseInt(match[1]);
    switch (match[2]) {
      case 'd':
        return num * 86400;
      case 'h':
        return num * 3600;
      case 'm':
        return num * 60;
      case 's':
      default:
        return num;
    }
  }
}
