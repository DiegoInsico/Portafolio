import React, { useState, useEffect } from 'react';
import { getReflexiones } from '../../firebase';
import EmotionsMap from '../../components/EmotionsMap';
import './EntryInfoPanel.css';

const EntryInfoPanel = ({ selectedEntry, currentUser }) => {
    const [reflexiones, setReflexiones] = useState([]);
    const [showReflexiones, setShowReflexiones] = useState(false);
    const [expandedReflections, setExpandedReflections] = useState([]);
    useEffect(() => {
        console.log("currentUser:", currentUser);
        console.log("selectedEntry:", selectedEntry);
    }, [currentUser, selectedEntry]);

    useEffect(() => {
        const fetchReflexiones = async () => {
            if (currentUser && selectedEntry && selectedEntry.entryId) {
                try {
                    const reflexionesData = await getReflexiones(
                        currentUser.uid,
                        selectedEntry.entryId
                    );
                    console.log("Reflexiones obtenidas:", reflexionesData);
                    setReflexiones(reflexionesData);
                } catch (error) {
                    console.error("Error fetching reflexiones:", error);
                }
            } else {
                console.log("No se puede obtener reflexiones: faltan currentUser o selectedEntry.entryId");
            }
        };
        fetchReflexiones();
    }, [currentUser, selectedEntry]);

    if (!selectedEntry) {
        return null;
    }


    // Manejo de la fecha de creación
    let creationDateStr = "Desconocida";
    if (selectedEntry.fechaCreacion) {
        let creationDate;
        if (selectedEntry.fechaCreacion.toDate) {
            // Firestore Timestamp
            creationDate = selectedEntry.fechaCreacion.toDate();
        } else {
            creationDate = new Date(selectedEntry.fechaCreacion);
        }

        if (!isNaN(creationDate.getTime())) {
            creationDateStr = creationDate.toLocaleDateString();
        }
    }

    const emocionesList = Array.isArray(selectedEntry.emociones)
        ? selectedEntry.emociones
        : typeof selectedEntry.emociones === "string"
            ? selectedEntry.emociones.split(",").map((emo) => emo.trim())
            : [];


    const toggleReflection = (index) => {
        setExpandedReflections((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const renderReflectionText = (text, isExpanded) => {
        const MAX_LENGTH = 100; // Cambia esto según el límite deseado
        if (isExpanded || text.length <= MAX_LENGTH) {
            return text;
        }
        return `${text.slice(0, MAX_LENGTH)}...`;
    };
    return (
        <div className="entry-info-panel">
            {/* Panel de información de la entrada */}
            <div className={`info-content ${showReflexiones ? 'hidden' : ''}`}>
                <div className='info-header'>
                    <h2>{selectedEntry.nickname || "Detalle de Entrada"}</h2>
                    <button className="ver-reflexiones-button" onClick={() => setShowReflexiones(true)}>
                        Ver Reflexiones
                    </button>
                </div>

                <div className="info-section">
                    <p><strong>Categoría:</strong> {selectedEntry.categoria || "Sin categoría"}</p>
                    <p><strong>Fecha Creación:</strong> {creationDateStr}</p>
                </div>

                {selectedEntry.cancion && (
                    <div className="info-section">
                        <h3>Canción</h3>
                        <p><strong>Nombre:</strong> {selectedEntry.cancion.name}</p>
                        <p><strong>Artista:</strong> {selectedEntry.cancion.artist}</p>
                        {selectedEntry.cancion.albumImage && (
                            <img src={selectedEntry.cancion.albumImage} alt={selectedEntry.cancion.name} className="panel-img" />
                        )}
                        {selectedEntry.cancion.audioUrl && (
                            <audio controls>
                                <source src={selectedEntry.cancion.audioUrl} type="audio/mpeg" />
                                Tu navegador no soporta el audio.
                            </audio>
                        )}
                    </div>
                )}

                {selectedEntry.media && (
                    <div className="info-section">
                        <h3>{selectedEntry.mediaType === 'video' ? "Video" : "Imagen"}</h3>
                        {selectedEntry.mediaType === 'video' ? (
                            <video controls className="panel-media">
                                <source src={selectedEntry.media} type="video/mp4" />
                                Tu navegador no soporta el video.
                            </video>
                        ) : (
                            <img src={selectedEntry.media} alt="Media Entrada" className="panel-img" />
                        )}
                    </div>
                )}

                {selectedEntry.texto && (
                    <div className="info-section">
                        <h3>Texto</h3>
                        <p>{selectedEntry.texto}</p>
                    </div>
                )}

                {selectedEntry.audio && (
                    <div className="info-section">
                        <h3>Audio Adicional</h3>
                        <audio controls>
                            <source src={selectedEntry.audio} type="audio/mpeg" />
                            Tu navegador no soporta el audio.
                        </audio>
                    </div>
                )}

                {emocionesList.length > 0 && (
                    <div className="info-section">
                        <h3>Emociones</h3>
                        <div className="emociones-container">
                            <EmotionsMap emociones={emocionesList} />
                        </div>
                    </div>
                )}


            </div>

            {/* Panel de Reflexiones superpuesto */}
            <div className={`reflexiones-panel ${showReflexiones ? 'reflexiones-show' : ''}`}>
                <div className="reflexiones-header">
                    <h3>Reflexiones</h3>
                    <button className="close-reflexiones" onClick={() => setShowReflexiones(false)}>
                        &larr; Volver
                    </button>
                </div>
                <ul className="reflexiones-lista">
                    {reflexiones.map((reflexion, index) => {
                        const isExpanded = expandedReflections.includes(index);
                        return (
                            <li key={index} className="reflexion-item">
                                <p onClick={() => toggleReflection(index)}>
                                    {renderReflectionText(reflexion, isExpanded)}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default EntryInfoPanel;
