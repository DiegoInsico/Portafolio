import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';
import './FloatingMenuEntry.css';

const FloatingMenuEntry = React.forwardRef(({
    collageId,
    entryId,
    position,
    onClose,
    cardWidth,
    setCardWidth,
    cardHeight,
    setCardHeight,
    backgroundColor,
    setBackgroundColor
}, ref) => {

    const menuWidth = 300;
    const menuHeight = 310;

    const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (position) {
            const centerX = position.x + (cardWidth / 2) - (menuWidth / 2);
            const topY = position.y - menuHeight - 10;
            setCurrentPosition({ x: centerX, y: topY });
        }
    }, [position, cardWidth, cardHeight]);

    const handleDrag = (e, data) => {
        setCurrentPosition({ x: data.x, y: data.y });
    };

    const handleWidthChange = (e) => {
        const newWidth = parseInt(e.target.value, 10);
        setCardWidth(newWidth);
    };

    const handleHeightChange = (e) => {
        const newHeight = parseInt(e.target.value, 10);
        setCardHeight(newHeight);
    };

    const handleBackgroundColorChange = (e) => {
        const newColor = e.target.value;
        setBackgroundColor(newColor);
    };

    return (
        <div className="floating-menu-entry" onClick={onClose}>
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
                                max="350"
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
                                max="400"
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
