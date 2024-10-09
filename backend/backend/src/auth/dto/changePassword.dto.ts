import { IsString, MinLength, Matches } from 'class-validator';


// ChangePasswordDto
// Propósito: Permitir a un usuario autenticado cambiar su contraseña actual por una nueva.
// Contexto de Uso: Cuando un usuario está logueado en la aplicación y decide cambiar su contraseña por razones de seguridad o preferencia personal.

export class ChangePasswordDto {
  @IsString()
  contrasenaActual: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/[a-zA-Z]/, { message: 'La contraseña debe contener al menos una letra' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos un número' })
  contrasena: string;

  @IsString()
  confirmarContrasena: string;
}
