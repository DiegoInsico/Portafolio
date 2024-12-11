import React, { useState, useRef } from 'react';
import './DraggableTitle.css';
import FloatingMenu from '../../components/FloatingMenu';

const DraggableTitle = ({ title, setTitle, containerRef, collageId, titleData = {}, bringToFront, disabled, onTitlePropertiesChange }) => {
    const [position, setPosition] = useState(titleData.position || { x: 50, y: 20 });
    const [fontSize, setFontSizeState] = useState(titleData.fontSize || 24);
    const [fontFamily, setFontFamilyState] = useState(titleData.fontFamily || 'Arial');
    const [color, setColorState] = useState(titleData.color || '#000000');
    const [zIndex, setZIndex] = useState(titleData.zIndex || 1);

    const [showMenu, setShowMenu] = useState(false);
    const titleRef = useRef(null);
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
            if (!containerRef?.current || !titleRef.current) return;

            const deltaX = moveEvent.clientX - initialMouseX;
            const deltaY = moveEvent.clientY - initialMouseY;

            let newX = initialX + deltaX;
            let newY = initialY + deltaY;

            const containerRect = containerRef.current.getBoundingClientRect();
            const titleRect = titleRef.current.getBoundingClientRect();

            const minX = 0;
            const minY = 0;
            const maxX = containerRect.width - titleRect.width;
            const maxY = containerRect.height - titleRect.height;

            newX = Math.max(minX, Math.min(newX, maxX));
            newY = Math.max(minY, Math.min(newY, maxY));

            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);

            // Notificar cambios al padre
            onTitlePropertiesChange({
                position: { x: position.x, y: position.y },
                zIndex
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleTitleClick = (e) => {
        if (disabled) return;
        if (isDragging.current) return;
        e.stopPropagation();
        setShowMenu(true);
    };

    const setFontSize = (newSize) => {
        setFontSizeState(newSize);
        onTitlePropertiesChange({ fontSize: newSize });
    };

    const setFontFamily = (newFamily) => {
        setFontFamilyState(newFamily);
        onTitlePropertiesChange({ fontFamily: newFamily });
    };

    const setColor = (newColor) => {
        setColorState(newColor);
        onTitlePropertiesChange({ color: newColor });
    };

    return (
        <>
            <div
                ref={titleRef}
                className="draggable-title"
                style={{
                    left: position.x,
                    top: position.y,
                    zIndex: zIndex,
                    position: 'absolute',
                    cursor: disabled ? 'default' : 'move'
                }}
                onMouseDown={handleDragStart}
                onClick={handleTitleClick}
            >
                <h1 style={{ fontSize: `${fontSize}px`, fontFamily, color }}>
                    {title}
                </h1>
            </div>
            {!disabled && showMenu && (
                <FloatingMenu
                    collageId={collageId}
                    position={{ x: position.x + 100, y: position.y }}
                    onClose={() => setShowMenu(false)}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    fontFamily={fontFamily}
                    setFontFamily={setFontFamily}
                    color={color}
                    setColor={setColor}
                />
            )}
        </>
    );
};

export default DraggableTitle;
