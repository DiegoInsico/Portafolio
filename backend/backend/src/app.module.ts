import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // Permite acceder a las variables en cualquier parte del proyecto
  }),AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
