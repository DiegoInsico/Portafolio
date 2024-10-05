import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

  // Habilitar CORS
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // Habilita CORS
    await app.listen(3000, '0.0.0.0');
  }


bootstrap();
