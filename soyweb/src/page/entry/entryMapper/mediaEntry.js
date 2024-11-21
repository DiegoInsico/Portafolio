// src/components/MediaEntry.jsx
import React from 'react';
import './MediaEntry.css'; // Asegúrate de tener estilos específicos para MediaEntry

// Definimos el componente MediaEntry que acepta las props 'entry' y 'onClick'
const MediaEntry = ({ entry, onClick }) => {
    // Validación para asegurarnos de que onClick es una función antes de usarla
    if (typeof onClick !== 'function') {
        console.error("La prop 'onClick' no es una función en MediaEntry");
    }

    return (
        <div className="media-entry-card" onClick={() => onClick && onClick(entry)}>
            {/* Dependiendo del tipo de media (imagen, video, etc.), renderizamos un tipo diferente de contenido */}
            {entry.mediaType === 'image' ? (
                <img src={entry.media} alt="Media" className="media-entry-image" />
            ) : entry.mediaType === 'video' ? (
                <video controls className="media-entry-video">
                    <source src={entry.media} type="video/mp4" />
                    Tu navegador no soporta la etiqueta de video.
                </video>
            ) : null}

            <p className="media-text">{entry.texto}</p>
        </div>
    );
};

export default MediaEntry;
