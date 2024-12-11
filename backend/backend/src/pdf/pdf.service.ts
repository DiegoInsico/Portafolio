// src/pdf/pdf.service.ts

import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as PdfPrinter from 'pdfmake';

@Injectable()
export class PdfService {
  private printer: any;

  constructor() {
    const fonts = {
      Roboto: {
        normal: path.resolve(process.cwd(), 'src', 'fonts', 'Roboto-Regular.ttf'),
        bold: path.resolve(process.cwd(), 'src', 'fonts', 'Roboto-Medium.ttf'),
        italics: path.resolve(process.cwd(), 'src', 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.resolve(process.cwd(), 'src', 'fonts', 'Roboto-MediumItalic.ttf'),
      },
    };

    console.log('Rutas de fuentes:', fonts);
    this.printer = new PdfPrinter(fonts);
  }

  async generatePdf(usuario: any, categoriasReflexiones: any): Promise<Buffer> {
    const docDefinition = {
      content: [
        // Portada
        {
          stack: [
            { text: 'Libro de Reflexión', style: 'portadaTitulo' },
            { text: 'Explorando tus pensamientos y emociones', style: 'portadaSubtitulo' },
            { text: `\n${usuario.nombre}`, style: 'portadaNombre' },
          ],
          style: 'portada',
          pageBreak: 'after',
        },
        // Capítulos por Categoría
        ...Object.keys(categoriasReflexiones).map((categoria, index) => {
          const reflexionesCategoria = categoriasReflexiones[categoria];
          return [
            // Línea decorativa antes del título
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 595 - 40, y2: 0, lineWidth: 2, lineColor: '#6a0dad' }] },
            { text: categoria.charAt(0).toUpperCase() + categoria.slice(1), style: 'categoria' },
            // Reflexiones
            ...(reflexionesCategoria && reflexionesCategoria.length > 0
              ? reflexionesCategoria.map((reflexion) => ({
                  stack: [
                    { text: `${reflexion.nickname} - `, style: 'nickname' },
                    { text: `${reflexion.fechaString}\n`, style: 'fecha' },
                    { text: `"${reflexion.texto}"`, style: 'texto' },
                    { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 595 - 80, y2: 10, lineWidth: 1, dash: { length: 5 }, lineColor: '#cccccc' }] },
                  ],
                  margin: [0, 10, 0, 10],
                }))
              : [
                  { text: 'No hay reflexiones en esta categoría.\n\n', style: 'noReflexiones' },
                ]),
          ];
        }).flat(),
        // Pie de página
        { text: `Generado el: ${new Date().toLocaleDateString()}`, style: 'footer', alignment: 'center', margin: [0, 50, 0, 0] },
      ],
      styles: {
        portada: {
          alignment: 'center',
          margin: [0, 250, 0, 0],
        },
        portadaTitulo: {
          fontSize: 34,
          bold: true,
          color: '#6a0dad',
          margin: [0, 0, 0, 10],
        },
        portadaSubtitulo: {
          fontSize: 18,
          italics: true,
          color: '#6a0dad',
          margin: [0, 0, 0, 30],
        },
        portadaNombre: {
          fontSize: 20,
          bold: true,
          color: '#333333',
        },
        categoria: {
          fontSize: 24,
          bold: true,
          color: '#6a0dad',
          alignment: 'left',
          margin: [0, 20, 0, 10],
        },
        nickname: {
          bold: true,
          color: '#4b0082',
        },
        fecha: {
          italics: true,
          fontSize: 10,
          color: '#555',
        },
        texto: {
          italics: true,
          fontSize: 14,
          margin: [0, 5, 0, 5],
        },
        noReflexiones: {
          italics: true,
          color: '#555',
        },
        footer: {
          fontSize: 10,
          color: '#999',
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on('error', (err) => {
        reject(err);
      });
      pdfDoc.end();
    });
  }
}
