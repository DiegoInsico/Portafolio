// src/components/Card.js
import React, { useState } from 'react';
import './Card.css';
import axios from '../utils/axiosInstance';

function Card({ card, onClick }) {
  const [isSmallImage, setIsSmallImage] = useState(false);

  const getTipo = () => {
    if (card.media_url) {
      const extension = card.media_url.split('.').pop().toLowerCase();
      if (['mp4', 'avi', 'mov'].includes(extension)) return 'video';
      if (['mp3', 'wav', 'aac'].includes(extension)) return 'audio';
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'imagen';
    }
    return 'texto';
  };

  const tipo = getTipo();

  // Definir el ancho de la tarjeta según el tipo
  // Eliminamos el ancho fijo para permitir la flexibilidad
  // const getWidth = (tipo) => { ... } // Ya no es necesario

  // Construir la URL completa de media
  const mediaUrl = card.media_url
    ? `${axios.defaults.baseURL}${card.media_url}`
    : null;

  // Handler para determinar si la imagen es pequeña
  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    // Define un umbral para considerar una imagen como pequeña
    const SMALL_IMAGE_WIDTH = 200; // Ajusta según tus necesidades
    const SMALL_IMAGE_HEIGHT = 200;

    if (naturalWidth <= SMALL_IMAGE_WIDTH && naturalHeight <= SMALL_IMAGE_HEIGHT) {
      setIsSmallImage(true);
    }
  };

  return (
    <div className="card" onClick={onClick}>
      {tipo === 'texto' && <p>{card.mensaje}</p>}
      {tipo === 'video' && mediaUrl && (
        <video src={mediaUrl} controls className="media-content" />
      )}
      {tipo === 'audio' && mediaUrl && (
        <audio src={mediaUrl} controls className="media-content" />
      )}
      {tipo === 'imagen' && mediaUrl && (
        <img
          src={mediaUrl}
          alt={card.categoria}
          className={`media-content ${isSmallImage ? 'small-image' : ''}`}
          onLoad={handleImageLoad}
        />
      )}
    </div>
  );
}

export default Card;
