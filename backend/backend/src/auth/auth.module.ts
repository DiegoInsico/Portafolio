import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';


import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';  // Asegúrate de importar la entidad User
import { UserModule } from '../user/user.module'; // Importar el módulo del usuario

@Module({
  imports: [TypeOrmModule.forFeature([User]), UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
