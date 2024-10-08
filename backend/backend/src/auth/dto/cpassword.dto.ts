import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
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
