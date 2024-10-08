import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    EmailModule,
    JwtModule.register({
      secret: jwtConstants.secret, // Debes guardar el secreto de manera segura
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
})

export class AuthModule {}
