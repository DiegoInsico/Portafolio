import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

  // Habilitar CORS
  async function bootstrap() {

    
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // Habilita CORS
    await app.listen(3000, '0.0.0.0');

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza un error si se envían propiedades no definidas
      transform: true, // Transforma los payloads a los tipos esperados
    }));
  }


bootstrap();
