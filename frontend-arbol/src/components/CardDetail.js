// src/components/CardDetail.js
import React, { useState } from 'react';
import './CardDetail.css';
import axios from '../utils/axiosInstance';

function CardDetail({ card, onClose }) {
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

  // Construir la URL completa de media
  const mediaUrl = card.media_url
    ? `${axios.defaults.baseURL}${card.media_url}`
    : null;

  // Handler para determinar si la imagen es pequeña
  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    // Define un umbral para considerar una imagen como pequeña
    const SMALL_IMAGE_WIDTH = 300; // Ajusta según tus necesidades
    const SMALL_IMAGE_HEIGHT = 300;

    if (naturalWidth <= SMALL_IMAGE_WIDTH && naturalHeight <= SMALL_IMAGE_HEIGHT) {
      setIsSmallImage(true);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2>{card.categoria}</h2>
        {tipo === 'texto' && <p>{card.mensaje}</p>}
        {tipo === 'video' && mediaUrl && (
          <video src={mediaUrl} controls className="media-detail" />
        )}
        {tipo === 'audio' && mediaUrl && (
          <audio src={mediaUrl} controls className="media-detail" />
        )}
        {tipo === 'imagen' && mediaUrl && (
          <img
            src={mediaUrl}
            alt={card.categoria}
            className={`media-detail ${isSmallImage ? 'small-image' : ''}`}
            onLoad={handleImageLoad}
          />
        )}
        <p>Creado el: {new Date(card.fecha_creacion).toLocaleDateString()}</p>
        <p>Hora: {new Date(card.fecha_creacion).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

export default CardDetail;
