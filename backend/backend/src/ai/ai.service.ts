// src/ai/ai.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    @Inject('FIREBASE_ADMIN') private firebaseAdmin: typeof admin, // Inyecta FIREBASE_ADMIN
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    // Elimina la inicialización redundante de Firebase
    // admin.initializeApp({
    //   credential: admin.credential.applicationDefault(),
    // });
  }

  async getUserNameFromFirebase(userId: string): Promise<string> {
    const userRecord = await this.firebaseAdmin.auth().getUser(userId);
    return userRecord.displayName || 'Usuario';  // Retorna el nombre o "Usuario" si no tiene uno
  }

  async generateQuestion(userId: string): Promise<string> {
    try {
      const prompt = `
Genera una pregunta de reflexión breve para el usuario basada en la siguiente información. 
La pregunta debe promover la introspección personal del usuario, relacionada con sus experiencias de vida, emociones, aprendizajes, 
o mensajes que desea dejar a sus seres queridos. Asegúrate de que las preguntas sean simples y fáciles de responder.

Contexto del usuario:

El usuario está desarrollando su legado emocional y espiritual.
La aplicación permite crear perfiles personales, registrar experiencias significativas, y programar mensajes para familiares y seres queridos.
Los mensajes pueden ser consejos, sentimientos, secretos, deseos, y reflexiones personales.
El usuario puede asignar testigos y beneficiarios para recibir estos mensajes después de su fallecimiento.
Se busca fortalecer el vínculo emocional con los seres queridos.

Ejemplos de Preguntas:

¿Qué experiencia de vida te ha enseñado algo que quisieras compartir con tus seres queridos?
¿Cuál es un deseo importante que te gustaría expresar a alguien cercano?
¿Qué consejo te hubiera gustado recibir en algún momento difícil de tu vida?
¿Qué emoción sientes hoy que quisieras capturar y recordar?
¿Qué mensaje dejarías para alguien a quien amas profundamente?
¿Cómo te gustaría que te recordaran tus seres queridos?
¿Cuál es el aprendizaje más valioso que te ha dado la vida?
¿Qué secreto te gustaría que alguien importante en tu vida conociera?
¿Qué sentimiento deseas transmitirle a alguien especial en un futuro importante para esa persona?
¿Qué reflexión sobre tu propósito de vida te gustaría dejar como parte de tu legado?
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      });

      console.log('OpenAI response:', response); // Verifica si OpenAI responde correctamente

      return response.choices[0].message.content.trim();
    } catch (error) {
      // Mejor manejo del error
      if (error.response) {
        // Error desde la API de OpenAI
        console.error('OpenAI API Error:', error.response.status, error.response.data);
      } else {
        // Error general de conexión o de código
        console.error('General Error:', error.message);
      }
      throw new Error('Error generating question from OpenAI');
    }
  }

  // Funcion para generar emociones a partir del mensaje.
  async generateEmotion(text: string): Promise<string[]> {
    try {
      const prompt = `
        Analiza el siguiente texto y determina las dos emociones más predominantes, como "alegría", "tristeza", "amor", "nostalgia". No agregues explicaciones, solo responde con las emociones separadas por comas.
        Texto: "${text}"
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      });

      const emotions = response.choices[0].message.content.split(',').map(e => e.trim());
      return emotions;
    } catch (error) {
      console.error('Error generating emotions:', error);
      throw new Error('Error generating emotions from OpenAI');
    }
  }

  /**
   * Analiza el texto del certificado para determinar su validez.
   * @param text Texto extraído del certificado.
   * @returns Booleano indicando si es válido.
   */
  async analyzeCertificate(text: string): Promise<boolean> {
    try {
      const prompt = `
        Determina si el siguiente texto corresponde a un certificado de defunción válido. Responde únicamente con "válido" o "inválido".

        Texto: "${text}"
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      });

      const result = response.choices[0].message.content.trim().toLowerCase();
      this.logger.log(`Resultado del análisis de certificado: ${result}`);

      return result === 'válido';
    } catch (error) {
      this.logger.error('Error al analizar el certificado con OpenAI:', error);
      throw new Error('No se pudo analizar el certificado.');
    }
  }

  
}
