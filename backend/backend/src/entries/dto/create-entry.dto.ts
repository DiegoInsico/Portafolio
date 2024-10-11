import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsOptional()
  @IsString()
  @IsIn(['Consejo', 'Reflexión', 'Deseo', 'Mensaje'])
  category?: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  media_url?: string;
}
