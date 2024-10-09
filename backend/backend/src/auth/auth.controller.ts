import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Put, Request, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService,
              private emailService: EmailService,
              private readonly jwtService: JwtService,
  ) {}


  // INICIO DE SESION
   /**
   * Endpoint para autenticar al usuario y obtener un token JWT.
   * @param loginDto Datos de inicio de sesión del usuario.
   * @returns Token JWT si las credenciales son válidas.
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.correo, loginDto.contrasena);
    if (user) {
      return this.authService.login(user);
    }
    throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
  }

  // REGISTRAR UN NUEVO USUARIO
    /**
   * Endpoint para registrar un nuevo usuario.
   * @param registerDto Datos de registro del usuario.
   * @returns Información del usuario registrado (sin contraseña).
   */

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

  // CAMBIAR CONTRASENA
    /**
   * Endpoint para cambiar la contraseña del usuario autenticado.
   * @param req Información del usuario autenticado.
   * @param changePasswordDto Datos para cambiar la contraseña.
   * @returns Mensaje de éxito si la contraseña se actualizó correctamente.
   */

  @UseGuards(AuthGuard('jwt'))
  @Put('change-password')
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.userId;
    return this.authService.changePassword(userId, changePasswordDto);
  }

  // SOLICITAR CAMBIO DE CONTRASENA
    /**
   * Endpoint para solicitar un enlace de reseteo de contraseña.
   * @param requestDto Correo electrónico del usuario que solicita el reseteo.
   * @returns Mensaje de confirmación.
   */

  @Post('request-password-reset')
  async requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(requestDto);
    return { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };
  }

  // CAMBIAR CONTRASENA CON EL TOKEN
    /**
   * Endpoint para resetear la contraseña utilizando el token recibido.
   * @param resetDto Token de reseteo y nueva contraseña.
   * @returns Mensaje de éxito si la contraseña se resetea correctamente.
   */

    @Post('reset-password')
    async resetPassword(@Body() resetDto: ResetPasswordDto) {
      await this.authService.resetPassword(resetDto);
      return { message: 'Contraseña restablecida exitosamente.' };
    }


}

