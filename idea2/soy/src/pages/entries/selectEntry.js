import React from 'react';
import './SelectEntry.css';

const SelectedEntry = ({ entry }) => {
    if (!entry) {
        return <p className="no-selection">Selecciona una entrada para ver los detalles.</p>;
    }

    const creationDate = new Date(entry.fechaCreacion.seconds * 1000).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    return (
        <div className="entry-container">
            <div className="entry-background"></div> {/* Fondo difuminado */}
            {/* Fecha de creación */}
            <p className="entry-date">{creationDate}</p>

            {/* Categoría */}
            <p className="category"><strong>Categoría:</strong> {entry.categoria || "Sin categoría"}</p>

            {/* Emociones */}
            {entry.emociones && (
                <div className="emotions">
                    <strong>Emociones:</strong> {entry.emociones.join(", ")}
                </div>
            )}

            {/* Condicional: Mostrar media o canción */}
            {entry.media && entry.mediaType === "image" ? (
                <img src={entry.media} alt="Contenido de media" className="media-frame" />
            ) : entry.cancion ? (
                <div className="song-container">
                    {entry.cancion.albumImage && (
                        <img src={entry.cancion.albumImage} alt="Portada del álbum" className="media-frame" />
                    )}
                    <p><strong>{entry.cancion?.name}</strong></p>
                    <p><strong>Artista:</strong> {entry.cancion.artist}</p>
                </div>
            ) : null}
            {/* Título: texto de la entrada o nombre de la canción */}
            <h2 className="entry-title">{entry.texto || "Sin título"}</h2>

            {/* Reproductor de audio si existe */}
            {entry.audio && (
                <audio controls className="audio">
                    <source src={entry.audio} type="audio/mp3" />
                    Tu navegador no soporta el reproductor de audio.
                </audio>
            )}

            {/* Indicador de entrada protegida */}
            {entry.isProtected && (
                <p className="protected">🔒 Entrada protegida</p>
            )}
        </div>
    );
};

export default SelectedEntry;
