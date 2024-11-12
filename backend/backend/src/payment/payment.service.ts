// src/payment/payment.service.ts

import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { FirestoreService } from '../services/firestore/firestore.service';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private firestoreService: FirestoreService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY no está definido en las variables de entorno.');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-10-28.acacia', // Asegúrate de que esta versión sea correcta
    });
  }

  async createCheckoutSession(userId: string): Promise<string> {
    const priceId = this.configService.get<string>('STRIPE_PRICE_ID');
    if (!priceId) {
      throw new Error('STRIPE_PRICE_ID no está definido en las variables de entorno.');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL no está definido en las variables de entorno.');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/cancel`,
        metadata: { userId },
      });
      return session.url;
    } catch (error) {
      this.logger.error('Error al crear la sesión de checkout con Stripe:', error);
      throw new Error('Error al crear la sesión de checkout');
    }
  }

  async handleWebhook(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata.userId;

      if (userId) {
        try {
          await this.firestoreService.updateUserPremiumStatus(userId, true);
          this.logger.log(`Usuario ${userId} actualizado a premium.`);
        } catch (error) {
          this.logger.error(`Error al actualizar a premium para usuario ${userId}:`, error);
        }
      }
    }

    // Manejar otros tipos de eventos según sea necesario
  }

  getStripeEvent(payload: Buffer, signature: string, webhookSecret: string): Stripe.Event {
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET no está definido en las variables de entorno.');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
