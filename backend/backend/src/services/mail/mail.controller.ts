// src/services/mail.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Controller('mail')
export class MailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Ruta para enviar un correo de prueba.
   * Ejemplo: GET /mail/test?email=destinatario@example.com
   */
  @Get('test')
  async sendTestEmail(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('El parámetro "email" es requerido.');
    }

    const subject = 'Correo de Prueba desde NestJS con SendGrid';
    const html = `<p>¡Hola! Este es un correo de prueba enviado desde tu aplicación NestJS utilizando SendGrid.</p>`;

    try {
      await this.emailService.sendEmail(email, subject, html);
      return { message: 'Correo de prueba enviado exitosamente.' };
    } catch (error) {
      throw new BadRequestException('Error al enviar el correo de prueba.');
    }
  }
}
