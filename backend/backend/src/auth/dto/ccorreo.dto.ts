// src/auth/dto/request-password-reset.dto.ts

import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  correo: string;
}
