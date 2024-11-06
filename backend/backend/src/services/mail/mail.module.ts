// src/services/mail.module.ts
import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [MailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
