// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SpotifyModule } from './spotify/spotify.module';
import { ProgramarMensajeModule } from './programar-mensaje/programar-mensaje.module';
import { EmailModule } from './services/email/email.module';
import { FirestoreModule } from './services/firestore/firestore.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './payment/payment.module';
import { NotificationService } from './services/notification/notification.service';
import { OcrService } from './services/ocr/ocr.service';
import { CertificadoService } from './services/certificado/certificado.service';
import * as admin from 'firebase-admin';
import { AiService } from './ai/ai.service';
import { TasksService } from './tasks/tasks.service';
import { PdfModule } from './pdf/pdf.module';
import { ExtendedServiceAccount } from './interfaces/extended-service-account.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Permite acceder a las variables en cualquier parte del proyecto
    }),
    ScheduleModule.forRoot(), // Configura ScheduleModule
    AiModule,
    SpotifyModule,
    ProgramarMensajeModule,
    EmailModule,
    FirestoreModule,
    PaymentModule,
    PdfModule,
    // Nota: No debes incluir servicios directamente en `imports`
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OcrService,
    CertificadoService,
    TasksService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        if (!admin.apps.length) {
          const credential: ExtendedServiceAccount = {
            type: configService.get<string>('FIREBASE_TYPE'),
            project_id: configService.get<string>('FIREBASE_PROJECT_ID'),
            private_key_id: configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
            private_key: configService
              .get<string>('FIREBASE_PRIVATE_KEY')
              .replace(/\\n/g, '\n'),
            client_email: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
            client_id: configService.get<string>('FIREBASE_CLIENT_ID'),
            auth_uri: configService.get<string>('FIREBASE_AUTH_URI'),
            token_uri: configService.get<string>('FIREBASE_TOKEN_URI'),
            auth_provider_x509_cert_url: configService.get<string>(
              'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
            ),
            client_x509_cert_url: configService.get<string>(
              'FIREBASE_CLIENT_X509_CERT_URL',
            ),
            // universe_domain: configService.get<string>('FIREBASE_UNIVERSE_DOMAIN'), // Eliminar esta línea
          };

          admin.initializeApp({
            credential: admin.credential.cert(credential),
          });
        }
        return admin;
      },
      inject: [ConfigService],
    },
    NotificationService,
    AiService,
  ],
})
export class AppModule {}
