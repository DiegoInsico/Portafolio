import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async createTransaction(@Body() body) {
    const { amount, sessionId, buyOrder, returnUrl } = body;
    return this.paymentsService.createTransaction(amount, sessionId, buyOrder, returnUrl);
  }

  @Post('commit/:token')
  async commitTransaction(@Param('token') token: string) {
    return this.paymentsService.commitTransaction(token);
  }
}
