import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { EmailService } from 'src/email/email.service';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    public userService: UserService,
    private emailService: EmailService,
    public jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  /**
 * Valida las credenciales del usuario.
 * @param correo Correo electrónico del usuario.
 * @param contrasena Contraseña del usuario.
 * @returns Información del usuario si las credenciales son válidas.
 */
  async validateUser(correo: string, contrasena: string): Promise<any> {
    const user = await this.userService.findOneByEmail(correo);
    if (user && (await bcrypt.compare(contrasena, user.contrasena))) {
      const { contrasena, ...result } = user;
      return result;
    }
    return null;
  }

  /**
 * Genera un token JWT para el usuario autenticado.
 * @param user Información del usuario.
 * @returns Token JWT.
 */

  async login(user: any) {
    const payload = { correo: user.correo, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
 * Registra un nuevo usuario.
 * @param registerDto Datos de registro del usuario.
 * @returns Información del usuario registrado (sin contraseña).
 */

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
    const user = await this.userService.create({
      ...userData,
      contrasena: hashedPassword,
    });
    return user;
  }

  /**
 * Solicita un enlace de reseteo de contraseña.
 * @param requestDto Correo electrónico del usuario.
 */

  async requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<void> {
    const { correo } = requestDto;
    const user = await this.userService.findOneByEmail(correo);
    if (!user) {
      // Para seguridad, no revelar si el correo existe
      return;
    }

    try {
      // Generar token de reseteo
      const token = await this.jwtService.signAsync(
        { sub: user.id, correo: user.correo },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('RESET_PASSWORD_JWT_EXPIRES_IN') || '1h',
        },
      );

      // Crear enlace de reseteo
      const resetLink = `${this.configService.get<string>('FRONTEND_URL')}?token=${token}`;

      // Enviar correo
      await this.emailService.sendPasswordResetEmail(user.correo, resetLink);
    } catch (error) {
      console.error('Error al solicitar reseteo de contraseña:', error);
      throw new InternalServerErrorException('No se pudo solicitar el reseteo de contraseña.');
    }
  }

  /**
   * Resetea la contraseña del usuario utilizando el token.
   * @param resetDto Token y nueva contraseña.
   */
  async resetPassword(resetDto: ResetPasswordDto): Promise<void> {
    const { token, contrasena, confirmarContrasena } = resetDto;

    if (contrasena !== confirmarContrasena) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.sub;
      await this.userService.updatePassword(userId, contrasena);
    } catch (error) {
      console.error('Error al verificar token de reseteo:', error);
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  /**
 * Cambia la contraseña del usuario autenticado.
 * @param userId ID del usuario.
 * @param changePasswordDto Datos para cambiar la contraseña.
 */

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { contrasena, confirmarContrasena } = changePasswordDto;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordMatch) {
      throw new HttpException('La contraseña actual es incorrecta', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(confirmarContrasena, 10);
    user.contrasena = hashedNewPassword;
    await this.userService.update(user);

    return { message: 'Contraseña actualizada correctamente' };
  }

  // async generateJwtToken(user: User, expiresIn: string = '1h'): Promise<string> {
  //   const payload = { sub: user.id, correo: user.correo };
  //   return this.jwtService.sign(payload, { expiresIn });
  // }
}
