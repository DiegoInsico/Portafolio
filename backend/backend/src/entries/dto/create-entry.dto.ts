import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateEntryDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Consejo', 'Reflexión', 'Deseo'])
  category: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  media_url?: string;
}
