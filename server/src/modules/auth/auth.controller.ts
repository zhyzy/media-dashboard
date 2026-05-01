import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.authService.validateUser(req.user.id);
    if (!user) {
      return { userId: 0, userName: '', roles: [], buttons: [] };
    }
    return {
      userId: user.id,
      userName: user.username,
      roles: [user.role === 'admin' ? 'R_SUPER' : 'R_ADMIN'],
      buttons: [],
    };
  }
}
