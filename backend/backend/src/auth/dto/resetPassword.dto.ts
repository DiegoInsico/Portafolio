import { IsString, MinLength, Matches } from 'class-validator';

// Propósito: Permitir a un usuario no autenticado (generalmente porque ha olvidado su contraseña) restablecer su contraseña utilizando un token de reseteo que se envía por correo electrónico.
// Contexto de Uso: Cuando un usuario no puede acceder a su cuenta porque ha olvidado su contraseña y necesita restablecerla.

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'La contraseña debe contener al menos una letra' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos un número' })
  contrasena: string;

  @IsString()
  confirmarContrasena: string;
}
