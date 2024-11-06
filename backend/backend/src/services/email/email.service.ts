// src/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    const emailFrom = this.configService.get<string>('EMAIL_FROM');

    if (!sendGridApiKey) {
      this.logger.error('SENDGRID_API_KEY no está definido en las variables de entorno.');
      throw new Error('SENDGRID_API_KEY no está definido.');
    }

    if (!emailFrom) {
      this.logger.error('EMAIL_FROM no está definido en las variables de entorno.');
      throw new Error('EMAIL_FROM no está definido.');
    }

    this.logger.log(`EMAIL_FROM está configurado como: ${emailFrom}`); // Log adicional

    sgMail.setApiKey(sendGridApiKey);
  }

  /**
   * Envía un correo electrónico utilizando SendGrid.
   * @param to Dirección de correo del destinatario.
   * @param subject Asunto del correo.
   * @param html Contenido HTML del correo.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const msg = {
      to,
      from: this.configService.get<string>('EMAIL_FROM'), // Dirección de correo verificada en SendGrid
      subject,
      html,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Correo enviado a ${to}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${to}:`, error);
      if (error.response) {
        this.logger.error(error.response.body);
      }
      throw new Error('No se pudo enviar el correo electrónico.');
    }
  }
}
