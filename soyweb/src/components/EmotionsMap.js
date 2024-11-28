// src/components/EmotionsMap.js

import React from "react";
import "./EmotionsMap.css"; // Asegúrate de crear este archivo con los estilos actualizados

const emotionColors = {
  felicidad: "#FFD700",
  tristeza: "#1E90FF",
  ira: "#FF4500",
  amor: "#FF69B4",
  miedo: "#8A2BE2",
  sorpresa: "#FFA500",
  ansiedad: "#00CED1",
  gratitud: "#32CD32",
  confianza: "#4B0082",
  enfado: "#DC143C",
  esperanza: "#7CFC00",
  soledad: "#696969",
  euforia: "#FF1493",
  resentimiento: "#FF6347",
  serenidad: "#20B2AA",
  nostalgia: "#BA55D3",
  culpa: "#B22222",
  frustracion: "#FF8C00",
  admiracion: "#FFB6C1",
  inspiracion: "#7B68EE",
  alivio: "#40E0D0",
  curiosidad: "#FF7F50",
  gratificacion: "#ADFF2F",
  optimismo: "#FFDAB9",
  desesperacion: "#8B0000",
  indiferencia: "#A9A9A9",
  placer: "#FF69B4",
  aburrimiento: "#D3D3D3",
  paz: "#98FB98",
  rechazo: "#FF6347",
  valentia: "#FF4500",
  amargura: "#800000",
  emocion: "#808080",
  orgullo: "#FF8C00",
  compasión: "#00FA9A",
  resignación: "#708090",
  excitacion: "#FF1493",
  celos: "#B22222",
  vergüenza: "#FFB6C1",
  desilusión: "#8B0000",
  melancolia: "#2F4F4F",
  timidez: "#DDA0DD",
  determinación: "#FF4500",
  culpabilidad: "#B22222",
  asombro: "#FFA500",
  hostilidad: "#DC143C",
  desconcierto: "#4682B4",
  depresión: "#2F4F4F",
  alegría: "#FFD700",
  contento: "#32CD32",
  irritación: "#FF4500",
  ansia: "#00CED1",
  arrepentimiento: "#B22222",
  aprecio: "#32CD32",
  calma: "#20B2AA",
  confusión: "#4682B4",
  desprecio: "#A9A9A9",
  descontento: "#FF6347",
  desapego: "#696969",
  deseo: "#FF69B4",
  envidia: "#B22222",
  excusa: "#FF6347",
  fascinación: "#FF1493",
  ilusión: "#FFD700",
  impaciencia: "#FF8C00",
  incomodidad: "#A9A9A9",
  indignación: "#FF4500",
  inseguridad: "#D3D3D3",
  insatisfacción: "#FF6347",
  júbilo: "#FFD700",
  nerviosismo: "#00CED1",
  vitalidad: "#32CD32",
  voluntad: "#7CFC00",
  // Añade más emociones y colores según sea necesario
};

const normalizeEmotion = (emotion) => {
  if (typeof emotion !== 'string') return '';
  return emotion.trim().toLowerCase();
};

const EmotionsMap = ({ emociones }) => {
  if (!emociones || emociones.length === 0) {
    return <p>N/A</p>;
  }

  return (
    <div className="emociones-section">
      <div className="emociones-grid">
        {emociones.map((emocion, index) => {
          const normalizedEmotion = normalizeEmotion(emocion);
          const color = emotionColors[normalizedEmotion] || "#808080"; // Gris por defecto
          return (
            <div
              key={index}
              className="emocion-box"
              style={{ backgroundColor: color }}
              title={emocion}
            >
              {/* Si deseas mostrar el nombre de la emoción dentro del bloque, descomenta la siguiente línea */}
              <span className="emotion-name">{emocion}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionsMap;
