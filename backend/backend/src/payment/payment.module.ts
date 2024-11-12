// src/payment/payment.module.ts

import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule } from '@nestjs/config';
import { FirestoreModule } from '../services/firestore/firestore.module'; // Asegúrate de importar correctamente

@Module({
  imports: [ConfigModule, FirestoreModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
