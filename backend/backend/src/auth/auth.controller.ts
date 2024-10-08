import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Put, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/cpassword.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService,
              private emailService: EmailService,
              private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.correo, loginDto.contrasena);
    if (user) {
      return this.authService.login(user);
    }
    throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {

    const { usuario, correo, contrasena, confirmarContrasena } = registerDto;

    if (contrasena !== confirmarContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    const existingUser = await this.authService.userService.findOneByEmail(registerDto.correo);
    if (existingUser) {
      throw new HttpException('El usuario ya existe', HttpStatus.BAD_REQUEST);
    }

    const user = await this.authService.register(registerDto);
    return user;
  }

  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    return this.authService.changePassword(userId, changePasswordDto);
  }
}

