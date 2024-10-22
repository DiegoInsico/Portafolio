import { Injectable } from '@nestjs/common';
import { WebpayPlus } from 'transbank-sdk';

@Injectable()
export class PaymentsService {
  private webpay: any;

  constructor() {
    // Configurar Webpay Plus
    this.webpay = new WebpayPlus.Transaction();
  }

  async createTransaction(amount: number, sessionId: string, buyOrder: string, returnUrl: string) {
    try {
      const response = await this.webpay.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );
      return response;
    } catch (error) {
      console.error('Error al crear la transacción:', error);
      throw new Error('Transacción fallida');
    }
  }

  async commitTransaction(token: string) {
    try {
      const response = await this.webpay.commit(token);
      return response;
    } catch (error) {
      console.error('Error al confirmar la transacción:', error);
      throw new Error('Confirmación fallida');
    }
  }
}
