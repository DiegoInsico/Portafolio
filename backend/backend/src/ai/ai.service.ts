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
      const prompt = `Genera una pregunta de reflexión para el usuario con ID ${userId} sobre su día, mes, anio, o vida personal. Puede ser tambien algo profundo. Emociones. Pero solo 1 pregunta y lo mas acotada posible.`;

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