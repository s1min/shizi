import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateChildDto } from './dto/update-child.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getInfo(@Req() req: any) {
    const user = await this.userService.findById(req.user.userId);
    if (!user) {
      return null;
    }
    return {
      userId: user._id,
      username: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      child: user.child || null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('updateInfo')
  async updateInfo(
    @Req() req: any,
    @Body() body: UpdateUserDto,
  ) {
    const user = await this.userService.updateProfile(req.user.userId, body);
    return {
      userId: user?._id,
      nickname: user?.nickname,
      avatar: user?.avatar,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('child')
  async updateChild(
    @Req() req: any,
    @Body() body: UpdateChildDto,
  ) {
    const user = await this.userService.updateChild(req.user.userId, body);
    return {
      userId: user?._id,
      child: user?.child || null,
    };
  }
}
