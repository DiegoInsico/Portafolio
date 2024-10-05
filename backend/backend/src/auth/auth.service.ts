import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/cpassword.dto';

@Injectable()
export class AuthService {
  constructor(
    public userService: UserService,
    public jwtService: JwtService,
  ) {}

  async validateUser(correo: string, contrasena: string): Promise<any> {
    const user = await this.userService.findOneByEmail(correo);
    if (user && (await bcrypt.compare(contrasena, user.contrasena))) {
      const { contrasena, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { correo: user.correo, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
    const user = await this.userService.create({
      ...userData,
      contrasena: hashedPassword,
    });
    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { contrasenaActual, nuevaContrasena } = changePasswordDto;
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    const passwordMatch = await bcrypt.compare(contrasenaActual, user.contrasena);
    if (!passwordMatch) {
      throw new HttpException('La contraseña actual es incorrecta', HttpStatus.BAD_REQUEST);
    }

    const hashedNewPassword = await bcrypt.hash(nuevaContrasena, 10);
    user.contrasena = hashedNewPassword;
    await this.userService.update(user);

    return { message: 'Contraseña actualizada correctamente' };
  }
}
