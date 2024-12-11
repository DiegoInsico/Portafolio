import React, { useState, useRef, useEffect } from 'react';
import './DraggableEntry.css';
import FloatingMenuEntry from '../../components/FloatinMenuEntry';

const DraggableEntry = ({ entry, collageId, containerRef, bringToFront, disabled, onEntryPropertiesChange }) => {
    const [position, setPosition] = useState(entry.position || { x: 100, y: 100 });
    const [cardWidth, setCardWidthState] = useState(entry.size?.width || 300);
    const [cardHeight, setCardHeightState] = useState(entry.size?.height || 400);
    const [backgroundColor, setBackgroundColorState] = useState(entry.backgroundColor || '#ffffff');
    const [zIndex, setZIndex] = useState(entry.zIndex || 1);

    const [showMenu, setShowMenu] = useState(false);
    const entryRef = useRef(null);
    const isDragging = useRef(false);

    const handleDragStart = (e) => {
        if (disabled) return;
        e.preventDefault();
        isDragging.current = true;

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

            const containerRect = containerRef.current.getBoundingClientRect();
            const entryRect = entryRef.current.getBoundingClientRect();

            const minX = 0;
            const minY = 0;
            const maxX = containerRect.width - entryRect.width;
            const maxY = containerRect.height - entryRect.height;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Notificar cambios al padre
            onEntryPropertiesChange(entry.entryId, {
                position: { x: position.x, y: position.y },
                zIndex
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const toggleMenu = (e) => {
        if (disabled) return;
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                entryRef.current &&
                !entryRef.current.contains(e.target) &&
                !e.target.closest('.floating-menu-entry')
            ) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const setCardWidth = (newWidth) => {
        setCardWidthState(newWidth);
        onEntryPropertiesChange(entry.entryId, { size: { width: newWidth, height: cardHeight } });
    };

    const setCardHeight = (newHeight) => {
        setCardHeightState(newHeight);
        onEntryPropertiesChange(entry.entryId, { size: { width: cardWidth, height: newHeight } });
    };

    const setBackgroundColor = (newColor) => {
        setBackgroundColorState(newColor);
        onEntryPropertiesChange(entry.entryId, { backgroundColor: newColor });
    };

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
                    cursor: disabled ? 'default' : 'move'
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
            {!disabled && showMenu && (
                <FloatingMenuEntry
                    className="floating-menu-entry"
                    collageId={collageId}
                    entryId={entry.entryId}
                    onClose={() => setShowMenu(false)}
                    cardWidth={cardWidth}
                    setCardWidth={setCardWidth}
                    cardHeight={cardHeight}
                    setCardHeight={setCardHeight}
                    backgroundColor={backgroundColor}
                    setBackgroundColor={setBackgroundColor}
                />
            )}
        </>
    );
};

export default DraggableEntry;
