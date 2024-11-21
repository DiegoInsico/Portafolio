// src/components/SongEntry.jsx
import React from 'react';
import './SongEntry.css'; // Estilos específicos para SongEntry

const SongEntry = ({ entry, onClick }) => {
    return (
        <div className="song-entry-card" onClick={() => onClick(entry)}>
            <img src={entry.cancion.albumImage} alt={entry.cancion.name} className="song-entry-image" />
            <div className="song-entry-info">
                <p className="song-name">{entry.cancion.name}</p>
                <p className="song-artist">{entry.cancion.artist}</p>
            </div>
            <p className="song-text">{entry.texto}</p>
        </div>
    );
};

export default SongEntry;
