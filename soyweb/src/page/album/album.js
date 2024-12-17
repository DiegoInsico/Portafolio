import React, { useState, useEffect } from 'react';
import './Album.css';
import { useAuth } from '../auth/authContext';
import useEntries from '../entry/useEntries';
import {
    DndContext,
    useDroppable,
    useDraggable,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const Album = ({ selectedAlbum, localAlbumEntries, setLocalAlbumEntries }) => {
    const { modifyAlbum } = useAuth();

    const {
        albumEntries,
        albumBackground,
        setAlbumBackground,
        updateAlbumEntries,
    } = useEntries(null, selectedAlbum);

    // Sensor personalizado que ignora eventos en inputs y textareas
    class CustomPointerSensor extends PointerSensor {
        static activators = [
            {
                eventName: 'onPointerDown',
                handler: ({ nativeEvent }) => {
                    if (nativeEvent.target.closest('input, textarea, select, option, button')) {
                        return false;
                    }
                    return true;
                },
            },
        ];
    }

    const sensors = useSensors(
        useSensor(CustomPointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (Array.isArray(albumEntries)) {
            const entriesWithPosition = albumEntries.map(entry => ({
                ...entry,
                position: entry.position || { x: 0, y: 0 },
            }));
            setLocalAlbumEntries(entriesWithPosition);
        }
    }, [albumEntries]);

    const handleBackgroundChange = async (e) => {
        if (!selectedAlbum) return;
        const newColor = e.target.value;
        setAlbumBackground(newColor);
        await modifyAlbum(selectedAlbum.id, { backgroundColor: newColor });
    };

    const handleAddTextArea = () => {
        const newTextEntry = {
            id: `text-${Date.now()}`,
            texto: '',
            position: { x: 0, y: 0 },
            isTextArea: true,
        };
        setLocalAlbumEntries(prevEntries => [...prevEntries, newTextEntry]);
    };

    const handleEntryClick = (entry) => {
        if (!selectedAlbum) return;

        const isSelected = localAlbumEntries.some(albumEntry => albumEntry.id === entry.id);

        if (isSelected) {
            setLocalAlbumEntries(prevEntries =>
                prevEntries.filter(albumEntry => albumEntry.id !== entry.id)
            );
        } else {
            if (localAlbumEntries.length >= 15) {
                alert("No puedes agregar más de 15 entradas a un álbum.");
                return;
            }
            setLocalAlbumEntries(prevEntries => [
                ...prevEntries,
                { ...entry, position: { x: 0, y: 0 } }
            ]);
        }
    };

    const handleDragEnd = (event) => {
        const { active, delta } = event;
        const entryId = active.id;

        setLocalAlbumEntries((entries) => {
            const updatedEntries = entries.map(entry => {
                if (entry.id === entryId) {
                    const newX = entry.position.x + delta.x;
                    const newY = entry.position.y + delta.y;
                    return {
                        ...entry,
                        position: { x: newX, y: newY },
                    };
                }
                return entry;
            });

            return updatedEntries;
        });
    };

    const handleSaveAlbumChanges = async () => {
        if (!selectedAlbum) return;

        try {
            const entriesData = localAlbumEntries.map(entry => ({
                id: entry.id,
                position: entry.position,
                texto: entry.isTextArea ? entry.texto : undefined,
                isTextArea: entry.isTextArea || false,
            }));
            await updateAlbumEntries(modifyAlbum, selectedAlbum.id, entriesData);
            console.log("Cambios del álbum guardados correctamente");
            alert("Cambios guardados con éxito.");
        } catch (error) {
            console.error("Error al guardar los cambios del álbum:", error);
            alert("Ocurrió un error al guardar los cambios.");
        }
    };

    const DroppableContainer = ({ children }) => {
        const { setNodeRef } = useDroppable({
            id: 'droppable-container',
        });

        return (
            <div
                ref={setNodeRef}
                className="droppable-container"
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '80vh',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: albumBackground || '#ffffff',
                }}
            >
                {children}
            </div>
        );
    };

    const DraggableEntry = ({ entry }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
            id: entry.id.toString(),
        });

        const style = {
            transform: CSS.Translate.toString(transform),
            transition,
            position: 'absolute',
            top: entry.position.y,
            left: entry.position.x,
            cursor: isDragging ? 'grabbing' : 'grab',
            opacity: isDragging ? 0.5 : 1,
        };

        const handleTextChange = (e) => {
            const newText = e.target.value;
            setLocalAlbumEntries(prevEntries =>
                prevEntries.map(item =>
                    item.id === entry.id ? { ...item, texto: newText } : item
                )
            );
        };

        let content;

        if (entry.isTextArea) {
            content = (
                <textarea
                    value={entry.texto}
                    onChange={handleTextChange}
                    placeholder="Escribe aquí..."
                    style={{
                        resize: 'none',
                        width: '100%',
                        height: '100%',
                        border: '1px solid #ccc',
                        outline: 'none',
                        padding: '8px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        borderRadius: '8px',
                    }}
                />
            );
        } else {
            content = (
                <div className="entry-content">
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
                    {entry.media && !entry.cancion && (
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
                </div>
            );
        }

        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`draggable-entry ${isDragging ? 'dragging' : ''}`}
                {...attributes}
                {...listeners}
            >
                {content}
            </div>
        );
    };

    return (
        <div className="album-manager">
            {selectedAlbum ? (
                <>
                    <button className="add-text-area-btn" onClick={handleAddTextArea}>Agregar Área de Texto</button>
                    <div className="album-header">
                        <h2>{selectedAlbum.name}</h2>
                        <div className="album-actions">
                            <label htmlFor="bg-color">Color de Fondo:</label>
                            <input
                                type="color"
                                id="bg-color"
                                value={albumBackground}
                                onChange={handleBackgroundChange}
                                className="color-picker"
                            />
                        </div>
                    </div>
                    <p className="entry-count">{localAlbumEntries.length}/15</p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <DroppableContainer>
                            {localAlbumEntries.map((entry) => (
                                <DraggableEntry key={entry.id} entry={entry} />
                            ))}
                        </DroppableContainer>
                    </DndContext>
                    <button className="save-album-btn" onClick={handleSaveAlbumChanges}>
                        Guardar Cambios
                    </button>
                </>
            ) : (
                <p className="select-album-message">Selecciona un álbum para comenzar.</p>
            )}
        </div>
    );
};

export default Album;
