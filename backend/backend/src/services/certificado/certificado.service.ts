// src/services/certificado/certificado.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';
import { OcrService } from '../ocr/ocr.service';
import { AiService } from 'src/ai/ai.service';
import { NotificationService } from '../notification/notification.service';
import path from 'path';

@Injectable()
export class CertificadoService {
  private readonly logger = new Logger(CertificadoService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly ocrService: OcrService,
    private readonly aiService: AiService,
    private readonly notificationService: NotificationService,
  ) { }

  /**
   * Procesa un certificado: extrae texto, lo analiza y actualiza su estado.
   * @param certificadoId ID del certificado.
   */
  async processCertificate(certificadoId: string): Promise<void> {
    try {
      const certificado = await this.firestoreService.getCertificateById(certificadoId);
      if (!certificado) {
        this.logger.warn(`Certificado ${certificadoId} no encontrado.`);
        return;
      }

      let extractedText: string;

      // Determinar el tipo de archivo
      const fileExtension = path.extname(certificado.fileName).toLowerCase();
      if (fileExtension === '.pdf') {
        this.logger.log(`Procesando certificado PDF: ${certificado.fileName}`);
        extractedText = await this.ocrService.extractTextFromPdf(certificado.filePath, 'application/pdf');
      } else if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        this.logger.log(`Procesando certificado de imagen: ${certificado.fileName}`);
        const fileBuffer = await this.firestoreService.downloadFile(certificado.filePath);
        extractedText = await this.ocrService.extractTextFromImage(fileBuffer);
      } else {
        this.logger.warn(`Formato de archivo no soportado para el certificado ${certificado.fileName}.`);
        return;
      }

      const isValid = await this.aiService.analyzeCertificate(extractedText);

      if (isValid) {
        // Aprobar el certificado
        await this.firestoreService.updateCertificateStatus(certificadoId, 'approved');
        // Actualizar el estado del usuario a fallecido
        await this.firestoreService.updateUserIsDeceased(certificado.userId, true);
        // Notificar al testigo principal
        await this.notifyPrimaryTestigo(certificado.userId);
        this.logger.log(`Certificado ${certificadoId} aprobado. Usuario ${certificado.userId} marcado como fallecido.`);
      } else {
        // Rechazar el certificado
        await this.firestoreService.updateCertificateStatus(certificadoId, 'rejected');
        this.logger.log(`Certificado ${certificadoId} rechazado.`);
      }
    } catch (error) {
      this.logger.error(`Error al procesar el certificado ${certificadoId}:`, error);
      throw error;
    }
  }

  // Añadir este método dentro de CertificadoService
  private async notifyPrimaryTestigo(userId: string): Promise<void> {
    // Lógica para notificar al testigo principal
    await this.notificationService.notifyPrimaryTestigo(userId);
  }

  /**
   * Confirma la defunción del usuario asociado al certificado.
   * @param certificadoId ID del certificado.
   */
  async confirmarDefuncion(certificadoId: string): Promise<void> {
    try {
      const certificado = await this.firestoreService.getCertificateById(certificadoId);
      if (!certificado) {
        this.logger.warn(`Certificado ${certificadoId} no encontrado.`);
        return;
      }

      // Actualizar el estado del certificado a 'confirmed'
      await this.firestoreService.updateCertificateStatus(certificadoId, 'confirmed');

      // Publicar el legado del usuario
      await this.publishUserLegacy(certificado.userId);

      this.logger.log(`Defunción confirmada para el usuario ${certificado.userId}. Legado publicado.`);
    } catch (error) {
      this.logger.error(`Error al confirmar defunción para el certificado ${certificadoId}:`, error);
      throw error;
    }
  }

  /**
   * Publica el legado del usuario.
   * @param userId ID del usuario.
   */
  async publishUserLegacy(userId: string): Promise<void> {
    try {
      // Aquí puedes implementar la lógica para publicar el legado.
      // Por ejemplo, actualizar publicaciones para que sean públicas.

      const entradas = await this.firestoreService.getEntradasByUserId(userId);
      for (const entrada of entradas) {
        await this.firestoreService.updateEntradaIsPublic(entrada.id, true);
      }

      this.logger.log(`Legado publicado para el usuario ${userId}.`);
    } catch (error) {
      this.logger.error(`Error al publicar legado para el usuario ${userId}:`, error);
      throw error;
    }
  }
}
