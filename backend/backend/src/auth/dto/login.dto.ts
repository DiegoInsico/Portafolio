import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  correo: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}
