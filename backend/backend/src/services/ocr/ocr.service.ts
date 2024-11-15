// src/services/ocr/ocr.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private client: ImageAnnotatorClient;

  constructor(private configService: ConfigService) {
    this.client = new ImageAnnotatorClient({
      keyFilename: this.configService.get<string>('GOOGLE_CLOUD_KEYFILE'), // Ruta a tu archivo JSON de credenciales
    });
  }

  /**
   * Extrae texto de una imagen o PDF usando Google Cloud Vision API.
   * @param imageBuffer Buffer del archivo a analizar.
   * @returns Texto extraído.
   */
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.client.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      const text = detections[0] ? detections[0].description : '';
      this.logger.log('Texto extraído con éxito.');
      return text;
    } catch (error) {
      this.logger.error('Error al extraer texto:', error);
      throw error;
    }
  }
}
