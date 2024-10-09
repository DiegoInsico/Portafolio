// src/email/email.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const msg: SendGrid.MailDataRequired = {
      to,
      from: this.configService.get<string>('EMAIL_FROM'), // Asegúrate de que este correo esté verificado en SendGrid
      subject: 'Restablecimiento de Contraseña',
      text: `Hola,

Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para hacerlo:

${resetLink}

Este enlace expirará en una hora.

Si no solicitaste esto, por favor ignora este correo.

Saludos,
Equipo de Soporte`,
      html: `<p>Hola,</p>
             <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para hacerlo:</p>
             <a href="${resetLink}">Restablecer Contraseña</a>
             <p>Este enlace expirará en una hora.</p>
             <p>Si no solicitaste esto, por favor ignora este correo.</p>
             <p>Saludos,<br/>Equipo de Soporte</p>`,
    };

    try {
      await SendGrid.send(msg);
      console.log(`Correo de restablecimiento enviado a ${to}`);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw new InternalServerErrorException('Error al enviar correo de reseteo.');
    }
  }
}
