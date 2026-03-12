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
   * 微信登录：code → openid → 查找/创建用户 → 签发 JWT
   */
  async wxLogin(code: string) {
    const appid = this.configService.get<string>('WX_APPID');
    const secret = this.configService.get<string>('WX_APP_SECRET');

    // 调用微信 jscode2session
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;

    let openid: string;
    try {
      const { data } = await axios.get(url);
      if (data.errcode) {
        this.logger.warn(`微信登录失败: ${data.errcode} ${data.errmsg}`);
        throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`);
      }
      openid = data.openid;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('调用微信 API 失败', error);
      throw new UnauthorizedException('微信登录服务异常');
    }

    // 查找或创建用户
    const user = await this.userService.findOrCreateByOpenid(openid);

    // 签发 JWT
    const payload = { sub: user._id, openid: user.openid };
    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '7d');

    return {
      token,
      expiresIn: this.parseExpiresIn(expiresIn),
    };
  }

  /** 将 '7d' / '24h' / '3600' 等格式转为秒数 */
  private parseExpiresIn(val: string): number {
    const match = val.match(/^(\d+)(d|h|m|s)?$/);
    if (!match) return 604800; // 默认 7 天
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
