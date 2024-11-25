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

const Album = ({ selectedAlbum }) => {
    const { modifyAlbum } = useAuth();
    const [localAlbumEntries, setLocalAlbumEntries] = useState([]);

    const {
        albumEntries,
        albumBackground,
        setAlbumBackground,
        updateAlbumEntries,
    } = useEntries(null, selectedAlbum);

    // Configuración de sensores para @dnd-kit
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        if (Array.isArray(albumEntries)) {
            // Asegúrate de que cada entrada tenga una posición inicial
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
            }));
            await updateAlbumEntries(modifyAlbum, selectedAlbum.id, entriesData);
            console.log("Cambios del álbum guardados correctamente");
            alert("Cambios guardados con éxito.");
        } catch (error) {
            console.error("Error al guardar los cambios del álbum:", error);
            alert("Ocurrió un error al guardar los cambios.");
        }
    };

    // Componente para el contenedor droppable
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

    // Componente para cada entrada draggable
    const DraggableEntry = ({ entry }) => {
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
            id: entry.id.toString(),
        });

        const style = {
            transform: CSS.Translate.toString(transform),
            transition,
            position: 'absolute',
            border: 1,
            top: entry.position.y,
            left: entry.position.x,
            cursor: 'grab',
            opacity: isDragging ? 0.5 : 1,
        };

        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`draggable-entry ${isDragging ? 'dragging' : ''}`}
            >
                <div className="entry-content">
                    <image>{entry.media}</image>
                    <p>{entry.texto || 'Entrada sin texto'}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="album-manager">
            {selectedAlbum ? (
                <>
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
