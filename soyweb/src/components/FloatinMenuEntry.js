// FloatingMenuEntry.js

import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import './FloatingMenuEntry.css';
import { updateEntryProperties } from '../firebase';

const FloatingMenuEntry = React.forwardRef(({
    collageId,
    entryId,
    position,        // Posición { x, y } de la tarjeta
    onClose,
    cardWidth,
    setCardWidth,
    cardHeight,
    setCardHeight,
    backgroundColor,
    setBackgroundColor
}, ref) => {

    // Dimensiones fijas del menú (ajusta según tu CSS)
    const menuWidth = 300;
    const menuHeight = 310;

    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    // Cada vez que el componente se monta (al abrir el menú),
    // calculamos la posición para colocar el menú sobre la tarjeta.
    useEffect(() => {
        if (position) {
            const centerX = position.x + (cardWidth / 2) - (menuWidth / 2);
            const topY = position.y - menuHeight - 10; // 10px de margen encima de la tarjeta
            setCurrentPosition({ x: centerX, y: topY });
        }
    }, [position, cardWidth, cardHeight]);

    const handleDrag = (e, data) => {
        setCurrentPosition({ x: data.x, y: data.y });
    };

    const handleWidthChange = async (e) => {
        const newWidth = parseInt(e.target.value, 10);
        setCardWidth(newWidth);
        try {
            await updateEntryProperties(collageId, entryId, { size: { width: newWidth, height: cardHeight } });
        } catch (error) {
            console.error("Error actualizando el ancho:", error);
        }
    };

    const handleHeightChange = async (e) => {
        const newHeight = parseInt(e.target.value, 10);
        setCardHeight(newHeight);
        try {
            await updateEntryProperties(collageId, entryId, { size: { width: cardWidth, height: newHeight } });
        } catch (error) {
            console.error("Error actualizando el alto:", error);
        }
    };

    const handleBackgroundColorChange = async (e) => {
        const newColor = e.target.value;
        setBackgroundColor(newColor);
        try {
            await updateEntryProperties(collageId, entryId, { backgroundColor: newColor });
        } catch (error) {
            console.error("Error actualizando el color de fondo:", error);
        }
    };

    return (
        <div className="floating-menu-overlay" onClick={onClose}>
            <Draggable
                handle=".menu-header"
                cancel="input, textarea, select, option, button"
                position={currentPosition}
                onDrag={handleDrag}
            >
                <div
                    ref={ref}
                    className="floating-menu"
                    onClick={(e) => e.stopPropagation()}
                    style={{ width: `${menuWidth}px`, height: `${menuHeight}px` }}
                >
                    <div className="menu-header">
                        <span>Configuraciones</span>
                        <button className="close-button" onClick={onClose}>&times;</button>
                    </div>
                    <div className="menu-content">
                        <div className="setting-item">
                            <label htmlFor="card-width">Ancho:</label>
                            <input
                                type="range"
                                id="card-width"
                                min="200"
                                max="600"
                                value={cardWidth}
                                onChange={handleWidthChange}
                            />
                            <span>{cardWidth}px</span>
                        </div>
                        <div className="setting-item">
                            <label htmlFor="card-height">Alto:</label>
                            <input
                                type="range"
                                id="card-height"
                                min="200"
                                max="800"
                                value={cardHeight}
                                onChange={handleHeightChange}
                            />
                            <span>{cardHeight}px</span>
                        </div>
                        <div className="setting-item">
                            <label htmlFor="background-color">Color de Fondo:</label>
                            <input
                                type="color"
                                id="background-color"
                                value={backgroundColor}
                                onChange={handleBackgroundColorChange}
                            />
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    );
});

export default FloatingMenuEntry;
