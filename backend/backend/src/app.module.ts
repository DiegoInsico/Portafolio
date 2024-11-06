// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { SpotifyModule } from './spotify/spotify.module';
import { ProgramarMensajeModule } from './programar-mensaje/programar-mensaje.module';
import { EmailModule } from './services/email/email.module';
import { FirestoreModule } from './services/firestore/firestore.module';
import { ScheduleModule } from '@nestjs/schedule';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
