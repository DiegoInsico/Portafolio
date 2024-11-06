// src/services/mail.service.ts
import { Injectable, Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin, // Inyecta FIREBASE_ADMIN si es necesario
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Cambia esto si usas otro proveedor
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  // Envía un mensaje programado al correo electrónico especificado
  async sendScheduledMessage(email: string, link: string) {
    await this.transporter.sendMail({
      from: '"Soy" <no-reply@soy.com>', // Cambia el remitente si es necesario
      to: email,
      subject: 'El usuario Diego tiene algo para ti',
      html: `<p>Han programado un mensaje para ti el día de hoy. Puedes verlo aquí: <a href="${link}">Ver mensaje</a></p>`,
    });
  }
}
