// src/programar-mensaje/programar-mensaje.module.ts
import { Module } from '@nestjs/common';
import { ProgramarMensajeService } from './programar-mensaje.service';
import { ProgramarMensajeController } from './programar-mensaje.controller';
import { FirestoreModule } from '../services/firestore/firestore.module';
import { EmailModule } from '../services/email/email.module'; // Asegúrate de importar EmailModule

@Module({
  imports: [FirestoreModule, EmailModule], // Importa FirestoreModule y EmailModule
  controllers: [ProgramarMensajeController],
  providers: [ProgramarMensajeService],
})
export class ProgramarMensajeModule {}
