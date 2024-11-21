// src/components/TextEntry.jsx

import React from 'react';
import './TextEntry.css'; // Estilos específicos para TextEntry

const TextEntry = ({ entry, onClick }) => {
    return (
        <div className="text-entry-card">
            {entry.audio ? (
                <audio controls className="audio-player">
                    <source src={entry.audio} type="audio/mpeg" />
                    Tu navegador no soporta el elemento de audio.
                </audio>
            ) : null}
            <p className="text">{entry.texto || 'Entrada sin texto'}</p>
        </div>
    );
};

export default TextEntry;
