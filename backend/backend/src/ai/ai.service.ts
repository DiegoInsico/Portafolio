import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';


@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    // Inicializar Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }

  async getUserNameFromFirebase(userId: string): Promise<string> {
    const userRecord = await admin.auth().getUser(userId);
    return userRecord.displayName || 'Usuario';  // Retorna el nombre o "Usuario" si no tiene uno
  }

  async generateQuestion(userId: string): Promise<string> {
    try {
      const prompt = `
Genera una pregunta de reflexión breve para el usuario basada en la siguiente información. 
La pregunta debe promover la introspección personal del usuario, relacionada con sus experiencias de vida, emociones, aprendizajes, 
o mensajes que desea dejar a sus seres queridos. Asegúrate de que las preguntas sean profundas, pero simples y fáciles de responder.

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
}