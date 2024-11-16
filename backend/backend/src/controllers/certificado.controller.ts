// src/controllers/certificado.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FirestoreService } from '../services/firestore/firestore.service';
import { NotificationService } from '../services/notification/notification.service';
import { CertificadoService } from '../services/certificado/certificado.service';

@Controller('certificado')
export class CertificadoController {
  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly notificationService: NotificationService,
    private readonly certificadoService: CertificadoService, // Inyecta CertificadoService
  ) {}

  @Post('aprobar')
  async aprobarCertificado(@Body('certificadoId') certificadoId: string): Promise<{ message: string }> {
    // Lógica para aprobar el certificado
    await this.firestoreService.updateCertificateStatus(certificadoId, 'approved');

    // Obtener el usuario asociado al certificado
    const certificado = await this.firestoreService.getCertificateById(certificadoId);
    const userId = certificado.userId;

    // Actualizar el estado del usuario a fallecido
    await this.firestoreService.updateUserIsDeceased(userId, true);

    // Notificar al testigo principal
    await this.notificationService.notifyPrimaryTestigo(userId);

    return { message: 'Certificado aprobado y testigo notificado.' };
  }

  @Post('procesar')
  async procesarCertificado(@Body('certificadoId') certificadoId: string): Promise<{ message: string }> {
    await this.certificadoService.processCertificate(certificadoId);
    return { message: 'Certificado procesado correctamente.' };
  }

  @Post('confirmar')
  async confirmarDefuncion(@Body('certificadoId') certificadoId: string): Promise<{ message: string }> {
    await this.certificadoService.confirmarDefuncion(certificadoId);
    return { message: 'Defunción confirmada y legado publicado.' };
  }
}
