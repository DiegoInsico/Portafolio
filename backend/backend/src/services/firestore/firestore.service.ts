// src/services/firestore/firestore.service.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Entrada } from 'src/interfaces/entrada.interface';

interface ScheduledMessage {
  id: string;
  userId: string;
  beneficiarioId: string;
  email: string;
  fechaEnvio: admin.firestore.Timestamp;
  media: string;
  mediaType: string;
  enviado: boolean;
}

interface Testigo {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
}

@Injectable()
export class FirestoreService {
  private readonly logger = new Logger(FirestoreService.name);
  private db: FirebaseFirestore.Firestore;

  constructor(@Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin) {
    if (!this.firebaseAdmin.apps.length) {
      this.logger.error('Firebase Admin no está inicializado.');
      throw new Error('Firebase Admin no está inicializado.');
    } else {
      this.logger.log('Firebase Admin inicializado correctamente.');
    }
    this.db = this.firebaseAdmin.firestore();
  }
  
  // Obtiene mensajes programados que deben ser enviados y que no han sido enviados aún, y cuyo usuario ha fallecido
  async getScheduledMessagesDue(): Promise<ScheduledMessage[]> {
    try {
      const now = admin.firestore.Timestamp.now();
      this.logger.log(`Buscando mensajes programados hasta: ${now.toDate().toISOString()}`);
  
      const snapshot = await this.db
        .collection('mensajesProgramados')
        .where('fechaEnvio', '<=', now)
        .where('enviado', '==', false)
        .get();
  
      this.logger.log(`Mensajes encontrados: ${snapshot.size}`);
  
      const messages: ScheduledMessage[] = [];
  
      for (const doc of snapshot.docs) {
        const data = doc.data();
        this.logger.log(`Procesando mensaje ID: ${doc.id}`);
  
        // Validar que los campos necesarios existan
        if (
          data.userId &&
          data.beneficiarioId &&
          data.email &&
          data.fechaEnvio &&
          data.media &&
          data.mediaType !== undefined &&
          data.enviado !== undefined
        ) {
          const message: ScheduledMessage = {
            id: doc.id,
            userId: data.userId,
            beneficiarioId: data.beneficiarioId,
            email: data.email,
            fechaEnvio: data.fechaEnvio,
            media: data.media,
            mediaType: data.mediaType,
            enviado: data.enviado,
          };
  
          this.logger.log(`Mensaje ${message.id} tiene todos los campos requeridos.`);
  
          const user = await this.getUserById(message.userId);
  
          if (user) {
            this.logger.log(`Usuario ${message.userId} encontrado. isDeceased: ${user.isDeceased}`);
            if (user.isDeceased) {
              messages.push(message);
              this.logger.log(`Mensaje ${message.id} añadido para envío.`);
            } else {
              this.logger.log(`El usuario ${message.userId} aún no ha fallecido. Mensaje no enviado.`);
            }
          } else {
            this.logger.warn(`Usuario ${message.userId} no encontrado. Mensaje ${message.id} no enviado.`);
          }
        } else {
          this.logger.warn(`Datos incompletos para el mensaje ID: ${doc.id}. Se omitirá.`);
        }
      }
  
      return messages;
    } catch (error) {
      this.logger.error('Error al obtener mensajes programados:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
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

  // Actualiza el estado Premium de un usuario
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

  // Obtiene un usuario por su ID
  async getUserById(userId: string): Promise<FirebaseFirestore.DocumentData> {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        this.logger.warn(`Usuario con ID ${userId} no encontrado.`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error al obtener usuario ${userId}:`, error);
      throw error;
    }
  }

  // Obtener testigos por userId
  async getTestigosByUserId(userId: string): Promise<Testigo[]> {
    try {
      const snapshot = await this.db.collection('testigos').where('userId', '==', userId).get();
      const testigosList: Testigo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Testigo[];
      return testigosList;
    } catch (error) {
      this.logger.error(`Error al obtener los testigos para el usuario ${userId}:`, error);
      throw error;
    }
  }

  // Obtener un testigo por su ID
  async getTestigoById(testigoId: string): Promise<Testigo | null> {
    try {
      const testigoDoc = await this.db.collection('testigos').doc(testigoId).get();
      if (testigoDoc.exists) {
        return { id: testigoDoc.id, ...testigoDoc.data() } as Testigo;
      } else {
        this.logger.warn(`Testigo con ID ${testigoId} no encontrado.`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error al obtener testigo ${testigoId}:`, error);
      throw error;
    }
  }

  // Obtener certificados pendientes
  async getPendingCertificates(): Promise<FirebaseFirestore.DocumentData[]> {
    try {
      const snapshot = await this.db
        .collection('certificados')
        .where('status', '==', 'pending')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error('Error al obtener certificados pendientes:', error);
      throw error;
    }
  }

  // Actualizar el estado de un certificado
  async updateCertificateStatus(certificadoId: string, status: string): Promise<void> {
    try {
      await this.db.collection('certificados').doc(certificadoId).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(`Certificado ${certificadoId} actualizado a estado: ${status}`);
    } catch (error) {
      this.logger.error(`Error al actualizar estado del certificado ${certificadoId}:`, error);
      throw error;
    }
  }

  // Actualizar el campo isDeceased de un usuario
  async updateUserIsDeceased(userId: string, isDeceased: boolean): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).update({
        isDeceased,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(`Usuario ${userId} actualizado: isDeceased = ${isDeceased}`);
    } catch (error) {
      this.logger.error(`Error al actualizar isDeceased para usuario ${userId}:`, error);
      throw error;
    }
  }

  // Obtener un certificado por su ID
  async getCertificateById(certificadoId: string): Promise<FirebaseFirestore.DocumentData> {
    try {
      const certificadoDoc = await this.db.collection('certificados').doc(certificadoId).get();
      if (certificadoDoc.exists) {
        return { id: certificadoDoc.id, ...certificadoDoc.data() };
      } else {
        this.logger.warn(`Certificado con ID ${certificadoId} no encontrado.`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error al obtener certificado ${certificadoId}:`, error);
      throw error;
    }
  }

  // Actualizar el testigoId asociado a un certificado
  async updateCertificateTestigo(certificadoId: string, testigoId: string): Promise<void> {
    try {
      await this.db.collection('certificados').doc(certificadoId).update({
        testigoId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(`Certificado ${certificadoId} actualizado: testigoId = ${testigoId}`);
    } catch (error) {
      this.logger.error(`Error al actualizar testigoId para certificado ${certificadoId}:`, error);
      throw error;
    }
  }

  // Descargar un archivo desde Firebase Storage
  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const bucket = this.firebaseAdmin.storage().bucket();
      const file = bucket.file(filePath);
      const [data] = await file.download();
      this.logger.log(`Archivo ${filePath} descargado exitosamente.`);
      return data;
    } catch (error) {
      this.logger.error(`Error al descargar el archivo ${filePath}:`, error);
      throw error;
    }
  }

  // Obtener testigo principal
  async getPrimaryTestigo(userId: string): Promise<FirebaseFirestore.DocumentData | null> {
    try {
      const testigos = await this.getTestigosByUserId(userId);
      if (testigos.length > 0) {
        return testigos[0]; // Asumiendo que el primer testigo es el principal
      }
      this.logger.warn(`No se encontraron testigos para el usuario ${userId}.`);
      return null;
    } catch (error) {
      this.logger.error(`Error al obtener el testigo principal para el usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todas las entradas (legados) asociadas a un usuario.
   * @param userId ID del usuario.
   * @returns Array de entradas.
   */
  async getEntradasByUserId(userId: string): Promise<Entrada[]> {
    try {
      const entradasRef = this.db.collection('entradas');
      const snapshot = await entradasRef.where('userId', '==', userId).get();
      const entradas: Entrada[] = [];
      snapshot.forEach(doc => {
        entradas.push({ id: doc.id, ...doc.data() } as Entrada);
      });
      return entradas;
    } catch (error) {
      this.logger.error(`Error al obtener entradas para el usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza el campo `isPublic` de una entrada específica.
   * @param entradaId ID de la entrada.
   * @param isPublic Nuevo valor para `isPublic`.
   */
  async updateEntradaIsPublic(entradaId: string, isPublic: boolean): Promise<void> {
    try {
      const entradaRef = this.db.collection('entradas').doc(entradaId);
      await entradaRef.update({
        isPublic: isPublic,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      this.logger.log(`Entrada ${entradaId} actualizada: isPublic = ${isPublic}`);
    } catch (error) {
      this.logger.error(`Error al actualizar entrada ${entradaId}:`, error);
      throw error;
    }
  }
}
