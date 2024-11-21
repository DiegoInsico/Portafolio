import React from 'react';
import './Entry.css'; // Crear estilos para grid
import SongEntry from './entryMapper/songEntry';
import MediaEntry from './entryMapper/mediaEntry';
import TextAudioEntry from './entryMapper/textEntry';

const EntriesManager = ({ entries, albumEntries, onEntryClick }) => {
    const getEntryType = (entry) => {
        if (entry.cancion) {
            return 'song';
        } else if (entry.media && entry.mediaType) {
            return 'media';
        } else if (entry.audio || entry.texto) {
            return 'textAudio';
        } else {
            return 'unknown';
        }
    };

    return (
        <div className="entries-manager">
            <div className="entries-selector">
                <h3>Entradas Disponibles</h3>
                <div className="entries-grid">
                    {entries.length === 0 ? (
                        <p>No hay entradas disponibles.</p>
                    ) : (
                        entries.map(entry => {
                            const entryType = getEntryType(entry);
                            let EntryComponent;

                            switch (entryType) {
                                case 'song':
                                    EntryComponent = SongEntry;
                                    break;
                                case 'media':
                                    EntryComponent = MediaEntry;
                                    break;
                                case 'textAudio':
                                    EntryComponent = TextAudioEntry;
                                    break;
                                default:
                                    return null;
                            }

                            const isSelected = albumEntries.some(ae => ae.id === entry.id);

                            return (
                                <div
                                    key={entry.id}
                                    className={`entry-card-wrapper ${isSelected ? 'selected' : ''}`}
                                    onClick={() => onEntryClick(entry)}
                                >
                                    <EntryComponent
                                        entry={entry}
                                        onClick={() => onEntryClick(entry)} // Pasar onEntryClick al componente
                                    />
                                    {isSelected && (
                                        <div className="selected-overlay">
                                            ✓
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntriesManager;
