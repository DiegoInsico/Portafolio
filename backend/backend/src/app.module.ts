import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Permite acceder a las variables en cualquier parte del proyecto
  }),AiModule, SpotifyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
