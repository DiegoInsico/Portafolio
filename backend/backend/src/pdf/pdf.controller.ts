// src/pdf/pdf.controller.ts

import { Controller, Post, Res, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  async generatePdf(
    @Body('usuario') usuario: any,
    @Body('categorias') categoriasReflexiones: any,
    @Res() res: Response,
  ) {
    try {
      console.log('Usuario recibido:', usuario);
      console.log('Categorías recibidas:', categoriasReflexiones);

      // Generar el PDF
      const pdfBuffer = await this.pdfService.generatePdf(usuario, categoriasReflexiones);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="LibroDeReflexion.pdf"',
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generando el PDF:', error);
      throw new HttpException('Error generando el PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
