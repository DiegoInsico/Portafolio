import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ // Asegúrate de que se llame en el módulo raíz
    isGlobal: true, // Esto permite que ConfigModule sea accesible en toda la aplicación
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'postgres',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
