// FloatingMenu.js

import React from 'react';
import './FloatingMenu.css';
import { updateCollageTitleProperties } from '../firebase'; // Asegúrate de tener esta función

const FloatingMenu = ({
    collageId, // Añadido
    position,
    onClose,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    color,
    setColor
}) => {
    // Manejar clic fuera del menú para cerrarlo
    const handleClickOutside = (e) => {
        if (e.target.className === 'floating-menu-overlay') {
            onClose();
        }
    };

    // Manejar cambios en el tamaño de fuente
    const handleFontSizeChange = (e) => {
        const newFontSize = parseInt(e.target.value, 10);
        setFontSize(newFontSize);
        // Actualizar Firestore con el nuevo tamaño de fuente
        updateCollageTitleProperties(collageId, { fontSize: newFontSize })
            .catch(error => {
                console.error("Error actualizando el tamaño de fuente:", error);
            });
    };

    // Manejar cambios en la familia de fuente
    const handleFontFamilyChange = (e) => {
        const newFontFamily = e.target.value;
        setFontFamily(newFontFamily);
        // Actualizar Firestore con la nueva familia de fuente
        updateCollageTitleProperties(collageId, { fontFamily: newFontFamily })
            .catch(error => {
                console.error("Error actualizando la familia de fuente:", error);
            });
    };

    // Manejar cambios en el color
    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setColor(newColor);
        // Actualizar Firestore con el nuevo color
        updateCollageTitleProperties(collageId, { color: newColor })
            .catch(error => {
                console.error("Error actualizando el color:", error);
            });
    };

    return (
        <div className="floating-menu-overlay" onClick={handleClickOutside}>
            <div className="floating-menu" style={{ top: position.y, left: position.x }}>
                <div className="menu-header">
                    <span>Configuraciones</span>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="menu-content">
                    <div className="setting-item">
                        <label htmlFor="font-size">Tamaño de Fuente:</label>
                        <input
                            type="range"
                            id="font-size"
                            min="12"
                            max="100"
                            value={fontSize}
                            onChange={handleFontSizeChange}
                        />
                        <span>{fontSize}px</span>
                    </div>
                    <div className="setting-item">
                        <label htmlFor="font-family">Fuente:</label>
                        <select
                            id="font-family"
                            value={fontFamily}
                            onChange={handleFontFamilyChange}
                        >
                            <option value="Arial">Arial</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Courier New">Courier New</option>
                            <option value="Georgia">Georgia</option>
                            {/* Añade más fuentes según tus necesidades */}
                        </select>
                    </div>
                    <div className="setting-item">
                        <label htmlFor="color">Color:</label>
                        <input
                            type="color"
                            id="color"
                            value={color}
                            onChange={handleColorChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingMenu;
