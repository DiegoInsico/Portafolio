import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto) {
    return this.authService.login(loginDto);
  }

  @Post('registro')
  async register(@Body() registerDto) {
    return this.authService.register(registerDto);
  }
}
