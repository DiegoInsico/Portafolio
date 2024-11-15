// src/programar-mensaje/programar-mensaje.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirestoreService } from '../services/firestore/firestore.service';
import { EmailService } from '../services/email/email.service';

@Injectable()
export class ProgramarMensajeService {
  private readonly logger = new Logger(ProgramarMensajeService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly emailService: EmailService,
  ) {}

  @Cron('* * * * *') // Este cron job se ejecuta cada minuto
  async handleScheduledMessages() {
    this.logger.log('Ejecutando cron job para mensajes programados...');
    const now = new Date();
    this.logger.log(`Hora actual: ${now.toISOString()}`);
  
    try {
      const messages = await this.firestoreService.getScheduledMessagesDue();
      this.logger.log(`Cantidad de mensajes programados encontrados: ${messages.length}`);
  
      for (const message of messages) {
        this.logger.log(`Procesando mensaje ID: ${message.id}`);
  
        if (!message.email) {
          this.logger.warn(`El mensaje ${message.id} no tiene un campo 'email'. Se omitirá.`);
          continue;
        }
  
        // Generar un link único para el mensaje
        const link = `https://tuapp.com/view-message/${message.id}`;
        const subject = 'Tienes un Mensaje Programado de Soy';
        const html = `<p>Hola,</p><p>Han programado un mensaje para ti el día de hoy. Puedes verlo aquí: <a href="${link}">Ver mensaje</a></p>`;
  
        this.logger.log(`Enviando correo a: ${message.email} con el enlace: ${link}`);
  
        try {
          await this.emailService.sendEmail(message.email, subject, html);
          this.logger.log(`Mensaje ${message.id} enviado a ${message.email}`);
  
          // Marcar el mensaje como enviado
          await this.firestoreService.markMessageAsSent(message.id);
          this.logger.log(`Mensaje ${message.id} marcado como enviado.`);
        } catch (error) {
          this.logger.error(`Error al enviar mensaje ${message.id} a ${message.email}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Error al obtener mensajes programados:', error);
    }
  }
  
}
