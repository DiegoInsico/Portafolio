import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Put, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/cpassword.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.correo, body.contrasena);
    if (user) {
      return this.authService.login(user);
    }
    throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
  }

  @Post('register')
  async register(@Body() body) {
    const existingUser = await this.authService.userService.findOneByEmail(body.correo);
    if (existingUser) {
      throw new HttpException('El usuario ya existe', HttpStatus.BAD_REQUEST);
    }
    const user = await this.authService.register(body);
    return user;
  }

  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }
}

