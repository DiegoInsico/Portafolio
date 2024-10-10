import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { EntriesModule } from './entries/entries.module';
import { Entry } from './entries/entities/entry.entity';

@Module({
  imports: [ConfigModule.forRoot({ // Asegúrate de que se llame en el módulo raíz
    isGlobal: true,
    envFilePath: '.env' // Esto permite que ConfigModule sea accesible en toda la aplicación
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'postgres',
      entities: [Entry],
      synchronize: true,
    }),
    EntriesModule,
    UserModule,
    AuthModule,
    EmailModule,
    EntriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
