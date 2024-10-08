// src/auth/dto/register.dto.ts

import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' })
  usuario: string;

  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  correo: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  contrasena: string;

  @IsString()
  confirmarContrasena: string;
}
