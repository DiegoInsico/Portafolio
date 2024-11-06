import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramarMensajeDto } from './create-programar-mensaje.dto';

export class UpdateProgramarMensajeDto extends PartialType(CreateProgramarMensajeDto) {}
