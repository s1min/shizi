import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WxLoginDto } from './dto/wx-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wxLogin')
  @HttpCode(200)
  async wxLogin(@Body() body: WxLoginDto) {
    return this.authService.wxLogin(body.code);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    // MVP 阶段：前端清 token 即可，后端仅返回成功
    return null;
  }
}
