import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsOptional()
  @IsString()
  @IsIn(['Consejo', 'Reflexión', 'Deseo', 'Mensaje', 'Recuerdo']) // Agrega 'Recuerdo' aquí
  category?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  media?: string;

  @IsOptional()
  @IsString()
  date?: string; // Añade este campo
}
