// src/components/DetalleEntrada.js

import React, { useState, useEffect } from "react";
import { getReflexiones } from "../firebase";
import EmotionsMap from "./EmotionsMap";
import "./DetalleEntrada.css";

// Importar el placeholder si es necesario
import defaultPlaceholder from "../assets/images/texto.webp";

const DetalleEntrada = ({ entrada, onClose, currentUser }) => {
  const [reflexiones, setReflexiones] = useState([]);
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [closing, setClosing] = useState(false);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  useEffect(() => {
    const fetchReflexiones = async () => {
      try {
        const reflexionesData = await getReflexiones(
          currentUser.uid,
          entrada.id
        );
        setReflexiones(reflexionesData);
      } catch (error) {
        console.error("Error fetching reflexiones:", error);
      }
    };

    fetchReflexiones();
  }, [currentUser.uid, entrada.id]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (isImageEnlarged) {
          setIsImageEnlarged(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isImageEnlarged]);

  const handleReflectionClick = (index) => {
    setSelectedReflection(selectedReflection === index ? null : index);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const emocionesList = Array.isArray(entrada.emociones)
    ? entrada.emociones
    : typeof entrada.emociones === "string"
    ? entrada.emociones.split(",").map((emo) => emo.trim())
    : [];

  const handleImageClick = () => {
    setIsImageEnlarged(true);
  };

  const handleImageClose = () => {
    setIsImageEnlarged(false);
  };

  // Función para renderizar el contenido basado en la entrada
  const renderMediaContent = () => {
    const { mediaType, media, cancion, texto, audio } = entrada;

    return (
      <>
        {/* Renderizar información de la canción y la imagen del álbum si existe un objeto cancion */}
        {cancion && (
          <>
            <div className="detalle-cancion-info">
              <h3>{cancion.name || "Sin nombre"}</h3>
              <p>{cancion.artist || "Artista desconocido"}</p>
            </div>
            <img
              src={cancion.albumImage || defaultPlaceholder}
              alt={cancion.name || "Sin nombre"}
              className="detalle-album-image"
            />
          </>
        )}

        {/* Renderizar el reproductor de audio si existe cancion.audioUrl */}
        {cancion?.audioUrl && (
          <div className="detalle-audio-adicional">
            <audio controls>
              <source src={cancion.audioUrl} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}

        {/* Renderizar media (imagen/video) si existe */}
        {media && (
          <>
            {mediaType === "video" ? (
              <div className="detalle-video">
                <video controls width="100%">
                  <source src={media} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            ) : (
              <img
                src={media || defaultPlaceholder}
                alt={entrada.nickname || "Sin nombre"}
                className="detalle-imagen-grande"
              />
            )}
          </>
        )}

        {/* Renderizar texto si existe */}
        {texto && (
          <div className="detalle-texto-adicional">
            <p>{texto}</p>
          </div>
        )}

        {/* Renderizar audio adicional si existe */}
        {audio && (
          <div className="detalle-audio-adicional">
            <audio controls>
              <source src={audio} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}

        {/* Mostrar placeholder si no hay contenido */}
        {!cancion && !media && !texto && !audio && (
          <img
            src={defaultPlaceholder}
            alt="Placeholder"
            className="detalle-imagen-grande"
          />
        )}
      </>
    );
  };

  // Determinar si se debe mostrar la sección de detalles
  const shouldShowDetails = entrada.media || (entrada.cancion && entrada.cancion.audioUrl);

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div
        className={`detalle-entrada ${closing ? "fade-out" : "fade-in"}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-entrada-titulo"
      >
        {/* Header */}
        <div className="detalle-header">
          <div className="header-left">
            <h2 id="detalle-entrada-titulo">
              {entrada.nickname || "Detalle de Entrada"}
            </h2>
            <div className="header-details">
              <span className="header-category">
                {entrada.categoria || "Sin categoría"}
              </span>
              <span className="header-date">
                {entrada.fechaCreacion
                  ? new Date(entrada.fechaCreacion).toLocaleDateString()
                  : "Fecha desconocida"}
              </span>
            </div>
          </div>
          <button
            className="close-button"
            onClick={handleClose}
            aria-label="Cerrar Detalle"
          >
            &times;
          </button>
        </div>

        {/* Divider */}
        <div className="detalle-divider"></div>

        {/* Main Content */}
        <div className="detalle-main">
          {/* Columna Izquierda: Contenido Principal */}
          <div className="detalle-columna izquierda">
            {/* Contenido basado en la entrada */}
            <div
              className="detalle-imagen"
              onClick={
                entrada.media || (entrada.cancion && entrada.cancion.audioUrl) ? handleImageClick : null
              }
              role={
                entrada.media || (entrada.cancion && entrada.cancion.audioUrl)
                  ? "button"
                  : "presentation"
              }
              tabIndex={
                entrada.media || (entrada.cancion && entrada.cancion.audioUrl)
                  ? 0
                  : -1
              }
              onKeyPress={(e) => {
                if (
                  (entrada.media || (entrada.cancion && entrada.cancion.audioUrl)) &&
                  e.key === "Enter"
                )
                  handleImageClick();
              }}
            >
              {renderMediaContent()}
              {/* Overlay para imágenes, videos y canciones */}
              {(entrada.media || (entrada.cancion && entrada.cancion.audioUrl)) && (
                <div className="imagen-overlay">
                  <i className="fas fa-search-plus"></i>
                </div>
              )}
            </div>
          </div>

          {/* Columna Central: Reflexiones */}
          <div className="detalle-columna central">
            {/* Reflexiones */}
            <div className="detalle-reflexiones">
              {reflexiones.length > 0 ? (
                reflexiones.length === 1 ? (
                  // Mostrar la única reflexión directamente
                  <div className="reflexion-item unico">
                    <div className="reflexion-full">
                      <i className="fas fa-quote-left"></i>
                      <p>{reflexiones[0]}</p>
                      <button
                        className="reflexion-close"
                        onClick={() => setSelectedReflection(null)}
                        aria-label="Cerrar Reflexión"
                      >
                        <i className="fas fa-times"></i> Cerrar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Mostrar múltiples reflexiones como botones
                  <ul className="detalle-reflexiones-lista">
                    {reflexiones.map((reflexion, index) => (
                      <li key={index} className="reflexion-item">
                        <button
                          className={`reflexion-button ${
                            selectedReflection === index ? "active" : ""
                          }`}
                          onClick={() => handleReflectionClick(index)}
                          aria-expanded={selectedReflection === index}
                        >
                          <i className="fas fa-quote-left"></i>
                          {reflexion.length > 50
                            ? `${reflexion.slice(0, 50)}...`
                            : reflexion}
                        </button>
                        {selectedReflection === index && (
                          <div className="reflexion-full">
                            <p>{reflexion}</p>
                            <button
                              className="reflexion-close"
                              onClick={() => setSelectedReflection(null)}
                              aria-label="Cerrar Reflexión"
                            >
                              <i className="fas fa-times"></i> Cerrar
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p>No hay reflexiones disponibles.</p>
              )}
            </div>
          </div>

          {/* Columna Derecha: Detalles y Emociones */}
          <div className="detalle-columna derecha">
            {/* Mostrar detalles solo si corresponde */}
            {shouldShowDetails && (
              <div className="detalle-detalles">
                <h3>
                  <i className="fas fa-info-circle"></i> Detalles
                </h3>
                <p>
                  <strong>
                    <i className="fas fa-tags"></i> Categoría:
                  </strong>{" "}
                  {entrada.categoria || "N/A"}
                </p>
                <p>
                  <strong>
                    <i className="fas fa-lock"></i> Protegido:
                  </strong>{" "}
                  {entrada.isProtected ? "Sí" : "No"}
                </p>
                <p>
                  <strong>
                    <i className="fas fa-calendar-day"></i> Fecha de Recuerdo:
                  </strong>{" "}
                  {entrada.fechaRecuerdo
                    ? new Date(entrada.fechaRecuerdo).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            )}

            {/* Emociones */}
            {emocionesList.length > 0 && (
              <div className="detalle-emociones">
                <h3>
                  <i className="fas fa-palette"></i> Emociones
                </h3>
                <EmotionsMap emociones={emocionesList} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox para Imagen o Video Ampliado */}
      {isImageEnlarged && (entrada.media || (entrada.cancion && entrada.cancion.audioUrl)) && (
        <div className="lightbox-overlay" onClick={handleImageClose}>
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {entrada.mediaType === "video" ? (
              <video controls width="100%">
                <source src={entrada.media} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            ) : (
              <img
                src={
                  entrada.media ||
                  (entrada.cancion?.albumImage
                    ? entrada.cancion.albumImage
                    : defaultPlaceholder)
                }
                alt="Memoria Ampliada"
              />
            )}
            <button
              className="lightbox-close-button"
              onClick={handleImageClose}
              aria-label="Cerrar Imagen"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DetalleEntrada;
