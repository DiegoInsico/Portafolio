import React from 'react';
import './EntryCard.css';

const EntryCard = ({ entry, onClick, isCenter }) => {
    return (
        <div
            className={`entry-card ${isCenter ? 'center' : ''}`}
            onClick={() => onClick(entry)}
        >
            {/* Canción */}
            {entry.cancion && (
                <div className="entry-song">
                    <img
                        src={entry.cancion.albumImage}
                        alt={entry.cancion.name}
                        className="entry-image"
                    />
                    <div className="entry-info">
                        <p className="entry-title">{entry.cancion.name}</p>
                        <p className="entry-subtitle">{entry.cancion.artist}</p>
                    </div>
                </div>
            )}

            {/* Media */}
            {entry.media && (
                <div className="entry-media">
                    {entry.mediaType === 'image' ? (
                        <img src={entry.media} alt="Media" className="entry-image" />
                    ) : (
                        <video src={entry.media} controls className="entry-video" />
                    )}
                </div>
            )}

            {/* Texto y/o Audio */}
            {!entry.media && !entry.cancion && (entry.texto || entry.audio) && (
                <div className="entry-text-audio">
                    {entry.texto && <p className="entry-text">{entry.texto}</p>}
                    {entry.audio && (
                        <audio controls>
                            <source src={entry.audio} type="audio/mpeg" />
                            Tu navegador no soporta el audio.
                        </audio>
                    )}
                </div>
            )}

            {/* Información General */}
            <div className="entry-meta">
                <p className="entry-category" style={{ color: entry.color }}>
                    {entry.categoria}
                </p>
                {entry.fechaRecuerdo && <p className="entry-date">{entry.fechaRecuerdo}</p>}
            </div>
        </div>
    );
};

export default EntryCard;
