import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CertificadoService } from '../services/certificado/certificado.service';
import { FirestoreService } from '../services/firestore/firestore.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly certificadoService: CertificadoService,
    private readonly firestoreService: FirestoreService,
  ) {}

  // Tarea que se ejecuta cada 5 minutos
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCertificatesProcessing() {
    this.logger.log('Iniciando proceso de certificados pendientes.');

    try {
      const certificadosPendientes = await this.firestoreService.getPendingCertificates();

      for (const certificado of certificadosPendientes) {
        this.logger.log(`Procesando certificado ID: ${certificado.id}`);
        await this.certificadoService.processCertificate(certificado.id);
      }
    } catch (error) {
      this.logger.error('Error en el proceso de certificados pendientes:', error);
    }
  }
}
