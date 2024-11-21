// src/services/ocr/ocr.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private visionClient: ImageAnnotatorClient;
  private storageClient: Storage;

  constructor(private configService: ConfigService) {
    this.visionClient = new ImageAnnotatorClient({
      keyFilename: this.configService.get<string>('GOOGLE_CLOUD_KEYFILE'), // Ruta a tu archivo JSON de credenciales
    });

    this.storageClient = new Storage({
      keyFilename: this.configService.get<string>('GOOGLE_CLOUD_KEYFILE'), // Asegúrate de usar el mismo keyfile
    });
  }

  /**
   * Extrae texto de una imagen usando Google Cloud Vision API.
   * @param imageBuffer Buffer de la imagen a analizar.
   * @returns Texto extraído.
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      const [result] = await this.visionClient.textDetection(imageBuffer);
      const detections = result.textAnnotations;
      const text = detections[0] ? detections[0].description : '';
      this.logger.log('Texto extraído con éxito de la imagen.');
      return text;
    } catch (error) {
      this.logger.error('Error al extraer texto de la imagen:', error);
      throw error;
    }
  }

  /**
   * Extrae texto de un PDF usando Google Cloud Vision API.
   * @param pdfBuffer Buffer del PDF a analizar.
   * @param mimeType Tipo MIME del archivo (debe ser 'application/pdf').
   * @returns Texto extraído.
   */
  async extractTextFromPdf(
    pdfBuffer: Buffer,
    mimeType: string = 'application/pdf',
  ): Promise<string> {
    try {
      // Subir el PDF a Google Cloud Storage
      const bucketName = this.configService.get<string>('GCP_BUCKET_NAME');
      const tempFileName = `temp_${Date.now()}.pdf`;
      const bucket = this.storageClient.bucket(bucketName);
      const file = bucket.file(tempFileName);

      await file.save(pdfBuffer, {
        contentType: mimeType,
      });

      this.logger.log(`PDF subido temporalmente a GCS: ${tempFileName}`);

      // Configurar la solicitud
      const request = {
        requests: [
          {
            inputConfig: {
              mimeType: mimeType,
              gcsSource: {
                uri: `gs://${bucketName}/${tempFileName}`,
              },
            },
            features: [
              {
                type: protos.google.cloud.vision.v1.Feature.Type.DOCUMENT_TEXT_DETECTION,
              },
            ],
            outputConfig: {
              gcsDestination: {
                uri: `gs://${bucketName}/output/`,
              },
              batchSize: 2,
            },
          },
        ],
      };

      // Ejecutar la solicitud asíncrona
      const [operation] = await this.visionClient.asyncBatchAnnotateFiles(request);
      this.logger.log('Solicitud de procesamiento de PDF enviada.');

      // Esperar a que la operación finalice
      await operation.promise();
      this.logger.log('Procesamiento de PDF completado.');

      // Descargar los resultados
      const [files] = await bucket.getFiles({ prefix: 'output/' });

      let extractedText = '';

      for (const resultFile of files) {
        const [content] = await resultFile.download();
        const response = JSON.parse(content.toString('utf-8'));
        const pages = response.responses;
        for (const page of pages) {
          if (page.fullTextAnnotation) {
            extractedText += page.fullTextAnnotation.text + '\n';
          }
        }
        // Eliminar el archivo de resultado
        await resultFile.delete();
        this.logger.log(`Archivo de resultado ${resultFile.name} eliminado.`);
      }

      // Eliminar el archivo temporal
      await file.delete();
      this.logger.log(`Archivo temporal ${tempFileName} eliminado.`);

      return extractedText;
    } catch (error) {
      this.logger.error('Error al extraer texto del PDF:', error);
      throw error;
    }
  }
}
