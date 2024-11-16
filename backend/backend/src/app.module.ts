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
    // Nota: No debes incluir servicios directamente en `imports`
  ],
  controllers: [AppController],
  providers: [
    AppService,
    OcrService,
    CertificadoService,
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (configService: ConfigService) => {
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(configService.get<string>('GOOGLE_CLOUD_KEYFILE')),
          });
        }
        return admin;
      },
      inject: [ConfigService],
    },
    NotificationService,
    AiService
  ],
})
export class AppModule {}
