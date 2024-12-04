// DraggableEntry.js

import React, { useState, useRef, useEffect } from 'react';
import './DraggableEntry.css';
import FloatingMenuEntry from '../../components/FloatinMenuEntry';
import { updateEntryPositionInCollage, updateEntryProperties } from '../../firebase'; // Asegúrate de tener estas funciones

const DraggableEntry = ({ entry, collageId, containerRef, bringToFront }) => {
    // Proporcionar valores predeterminados si 'entry.size' es undefined
    const [position, setPosition] = useState(entry.position || { x: 100, y: 100 });
    const [cardWidth, setCardWidth] = useState(entry.size?.width || 300);
    const [cardHeight, setCardHeight] = useState(entry.size?.height || 400);
    const [backgroundColor, setBackgroundColor] = useState(entry.backgroundColor || '#ffffff');
    const [zIndex, setZIndex] = useState(entry.zIndex || 1); // Inicializar con zIndex de Firestore si está disponible

    const [showMenu, setShowMenu] = useState(false);
    const entryRef = useRef(null);
    const menuRef = useRef(null); // Referencia para el menú
    const isDragging = useRef(false); // Ref para rastrear el estado de arrastre

    // Manejar el inicio del arrastre
    const handleDragStart = (e) => {
        e.preventDefault();
        isDragging.current = true;

        // Obtener el nuevo zIndex desde el componente padre
        const newZIndex = bringToFront();
        setZIndex(newZIndex);

        const initialMouseX = e.clientX;
        const initialMouseY = e.clientY;
        const initialX = position.x;
        const initialY = position.y;

        const handleMouseMove = (moveEvent) => {
            if (!containerRef?.current || !entryRef.current) return;

            const deltaX = moveEvent.clientX - initialMouseX;
            const deltaY = moveEvent.clientY - initialMouseY;

            let newX = initialX + deltaX;
            let newY = initialY + deltaY;

            // Obtener dimensiones del contenedor y de la entrada
            const containerRect = containerRef.current.getBoundingClientRect();
            const entryRect = entryRef.current.getBoundingClientRect();

            // Calcular los límites
            const minX = 0;
            const minY = 0;
            const maxX = containerRect.width - entryRect.width;
            const maxY = containerRect.height - entryRect.height;

            // Restringir la posición dentro de los límites
            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            setPosition({
                x: newX,
                y: newY,
            });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Guardar la nueva posición y zIndex en Firestore solo si collageId está presente
            if (collageId) {
                updateEntryPositionInCollage(collageId, entry.entryId, { position, zIndex })
                    .catch(error => {
                        console.error("Error guardando la posición y zIndex:", error);
                    });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Alternar la visibilidad del menú
    const toggleMenu = (e) => {
        e.stopPropagation(); // Evita que el evento de clic inicie el arrastre
        setShowMenu(!showMenu);
    };

    // Cerrar el menú si se hace clic fuera
    const handleClickOutside = (e) => {
        if (
            entryRef.current &&
            !entryRef.current.contains(e.target) &&
            menuRef.current &&
            !menuRef.current.contains(e.target)
        ) {
            setShowMenu(false);
        }
    };

    useEffect(() => {
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <>
            <div
                ref={entryRef}
                className="draggable-entry"
                style={{
                    left: position.x,
                    top: position.y,
                    zIndex: zIndex,
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    backgroundColor: backgroundColor,
                    position: 'absolute', 
                }}
                onMouseDown={handleDragStart}
                onClick={toggleMenu}
            >
                <div className="entry-content">
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

                    {entry.media && (
                        <div className="entry-media">
                            {entry.mediaType === 'image' ? (
                                <img src={entry.media} alt="Media" className="entry-image" />
                            ) : (
                                <video src={entry.media} controls className="entry-video" />
                            )}
                        </div>
                    )}

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
            </div>
            {showMenu && (
                <FloatingMenuEntry
                    ref={menuRef} // Pasamos la referencia al menú
                    collageId={collageId} // Pasar collageId
                    entryId={entry.entryId} // Pasar entryId

                    onClose={() => setShowMenu(false)}
                    cardWidth={cardWidth}
                    setCardWidth={(newWidth) => {
                        setCardWidth(newWidth);
                        // Actualizar Firestore con el nuevo ancho
                        updateEntryProperties(collageId, entry.entryId, { size: { width: newWidth, height: cardHeight } }).catch(error => {
                            console.error("Error actualizando el ancho:", error);
                        });
                    }}
                    cardHeight={cardHeight}
                    setCardHeight={(newHeight) => {
                        setCardHeight(newHeight);
                        // Actualizar Firestore con el nuevo alto
                        updateEntryProperties(collageId, entry.entryId, { size: { width: cardWidth, height: newHeight } }).catch(error => {
                            console.error("Error actualizando el alto:", error);
                        });
                    }}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={(newColor) => {
                        setBackgroundColor(newColor);
                        // Actualizar Firestore con el nuevo color de fondo
                        updateEntryProperties(collageId, entry.entryId, { backgroundColor: newColor }).catch(error => {
                            console.error("Error actualizando el color de fondo:", error);
                        });
                    }}
                />
            )}
        </>
    );
};

export default DraggableEntry;
