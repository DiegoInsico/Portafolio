// src/email/email.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE'), // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'), // Remitente
      to,
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
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw new InternalServerErrorException('Error al enviar correo de reseteo.');
    }
  }
}
