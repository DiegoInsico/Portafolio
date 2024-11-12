// src/services/firestore/firestore.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private db: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin) {
    this.db = this.firebaseAdmin.firestore();
  }

  // Obtiene mensajes programados que deben ser enviados y que no han sido enviados aún
  async getScheduledMessages(): Promise<FirebaseFirestore.DocumentData[]> {
    try {
      const now = admin.firestore.Timestamp.now();
      this.logger.log(`Consultando mensajes con fechaEnvio <= ${now.toDate().toISOString()} y enviado == false`);

      const snapshot = await this.db
        .collection('mensajesProgramados')
        .where('fechaEnvio', '<=', now)
        .where('enviado', '==', false) // Filtra solo mensajes no enviados
        .get();

      this.logger.log(`Mensajes encontrados: ${snapshot.size}`);

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error('Error al obtener mensajes programados:', error);
      throw error;
    }
  }

  // Marca un mensaje como enviado
  async markMessageAsSent(id: string): Promise<void> {
    try {
      await this.db.collection('mensajesProgramados').doc(id).update({
        enviado: true,
      });
      this.logger.log(`Mensaje ${id} marcado como enviado.`);
    } catch (error) {
      this.logger.error(`Error al marcar el mensaje ${id} como enviado:`, error);
      throw error;
    }
  }

  // **Nuevo Método**: Actualiza el estado Premium de un usuario
  async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).update({
        isPremium,
      });
      this.logger.log(`Usuario ${userId} actualizado: isPremium = ${isPremium}`);
    } catch (error) {
      this.logger.error(`Error al actualizar isPremium para usuario ${userId}:`, error);
      throw error;
    }
  }
}
