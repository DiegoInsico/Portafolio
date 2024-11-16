// En tu servicio o controlador del backend
import { Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { FirestoreService } from '../firestore/firestore.service';

export class NotificationService {

    private readonly logger = new Logger(NotificationService.name);
    constructor(
        private emailService: EmailService,
        private firestoreService: FirestoreService,
    ) { }

    /**
       * Notifica al testigo principal de un usuario.
       * @param userId ID del usuario.
       */
    async notifyPrimaryTestigo(userId: string): Promise<void> {
        try {
            const testigo = await this.firestoreService.getPrimaryTestigo(userId);
            const user = await this.firestoreService.getUserById(userId);

            if (testigo && user) {
                const subject = 'Solicitud de Confirmación de Defunción';
                const html = `
          <p>Estimado/a ${testigo.name},</p>
          <p>Se ha detectado que el usuario <strong>${user.name}</strong> ha fallecido.</p>
          <p>Por favor, confirma esta información para proceder con la publicación del legado.</p>
          <p>Gracias.</p>
        `;

                await this.emailService.sendEmail(testigo.email, subject, html);
                this.logger.log(`Correo enviado al testigo principal (${testigo.email}) del usuario ${userId}.`);
            } else {
                this.logger.warn(`No se pudo notificar al testigo principal para el usuario ${userId}.`);
            }
        } catch (error) {
            this.logger.error(`Error al notificar al testigo principal para el usuario ${userId}:`, error);
        }
    }

    

}
