// src/components/LibroDeReflexion/LibroDeReflexionPDF.js

import React from "react";

const LibroDeReflexionPDF = ({ usuario, categoriasReflexiones }) => {
  const downloadPdf = async () => {
    try {
      // URL de tu backend
      const backendUrl = 'http://localhost:3000/pdf/generate';

      // Realizar la solicitud POST para obtener el PDF
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario,
          categorias: categoriasReflexiones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'LibroDeReflexion.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
    }
  };

  return (
    <div className="lr-pdf-container">
      <button className="lr-pdf-button" onClick={downloadPdf}>
        Descargar PDF
      </button>
    </div>
  );
};

export default LibroDeReflexionPDF;
