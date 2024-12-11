import React from 'react';
import './FloatingMenu.css';

const FloatingMenu = ({
    collageId,
    position,
    onClose,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    color,
    setColor
}) => {
    const handleClickOutside = (e) => {
        if (e.target.className === 'floating-menu-overlay') {
            onClose();
        }
    };

    const handleFontSizeChange = (e) => {
        const newFontSize = parseInt(e.target.value, 10);
        setFontSize(newFontSize);
    };

    const handleFontFamilyChange = (e) => {
        const newFontFamily = e.target.value;
        setFontFamily(newFontFamily);
    };

    const handleColorChange = (e) => {
        const newColor = e.target.value;
        setColor(newColor);
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
