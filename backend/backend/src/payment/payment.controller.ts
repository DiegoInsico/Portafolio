// src/payment/payment.controller.ts

import { Controller, Post, Body, Req, Res, Headers, HttpCode } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body('userId') userId: string,
    @Res() res: Response,
  ) {
    try {
      const url = await this.paymentService.createCheckoutSession(userId);
      return res.json({ url });
    } catch (error) {
      console.error('Error al crear la sesión de checkout:', error);
      return res.status(500).json({ message: 'Error al crear la sesión de checkout' });
    }
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const webhookSecret = this.paymentService['configService'].get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.paymentService.getStripeEvent(req.body, signature, webhookSecret);
    } catch (err) {
      console.error('Error al construir el evento de Stripe:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      await this.paymentService.handleWebhook(event);
      res.json({ received: true });
    } catch (error) {
      console.error('Error al manejar el webhook de Stripe:', error);
      res.status(500).json({ message: 'Error al procesar el webhook' });
    }
  }
}
