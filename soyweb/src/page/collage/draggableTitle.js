// DraggableTitle.js

import React, { useState, useRef, useEffect } from 'react';
import './DraggableTitle.css';
import FloatingMenu from '../../components/FloatingMenu';
import { updateCollageTitleProperties } from '../../firebase'; // Asegúrate de tener esta función

const DraggableTitle = ({ title, setTitle, containerRef, collageId = null, titleData = {}, bringToFront }) => {
    const [position, setPosition] = useState(titleData.position || { x: 50, y: 20 });
    const [fontSize, setFontSize] = useState(titleData.fontSize || 24);
    const [fontFamily, setFontFamily] = useState(titleData.fontFamily || 'Arial');
    const [color, setColor] = useState(titleData.color || '#000000');
    const [zIndex, setZIndex] = useState(titleData.zIndex || 1);

    const [showMenu, setShowMenu] = useState(false);
    const titleRef = useRef(null);
    const isDragging = useRef(false); // Ref para rastrear el estado de arrastre

    // Manejar el inicio del arrastre
    const handleDragStart = (e) => {
        e.preventDefault();
        isDragging.current = true;

        // Actualizar el z-index al iniciar el arrastre
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

            // Obtener dimensiones del contenedor y del título
            const containerRect = containerRef.current.getBoundingClientRect();
            const titleRect = titleRef.current.getBoundingClientRect();

            // Calcular los límites
            const minX = 0;
            const minY = 0;
            const maxX = containerRect.width - titleRect.width;
            const maxY = containerRect.height - titleRect.height;

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
                updateCollageTitleProperties(collageId, {
                    titlePosition: position,
                    titleZIndex: zIndex
                })
                    .catch(error => {
                        console.error("Error guardando la posición del título:", error);
                    });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Alternar la visibilidad del menú
    const handleTitleClick = (e) => {
        if (isDragging.current) return; // Evita que el clic abra el menú si se está arrastrando
        e.stopPropagation(); // Evita que el clic inicie el arrastre
        setShowMenu(true);
    };

    // Cerrar el menú
    const handleCloseMenu = () => {
        setShowMenu(false);
    };

    return (
        <>
            <div
                ref={titleRef}
                className="draggable-title"
                style={{ left: position.x, top: position.y, zIndex: zIndex, position: 'absolute', cursor: 'move' }}
                onMouseDown={handleDragStart}
                onClick={handleTitleClick}
            >
                <h1 style={{ fontSize: `${fontSize}px`, fontFamily: fontFamily, color: color }}>
                    {title}
                </h1>
            </div>
            {showMenu && (
                <FloatingMenu
                    collageId={collageId} // Pasar collageId para actualizar Firestore
                    position={{ x: position.x + 100, y: position.y }}
                    onClose={handleCloseMenu}
                    fontSize={fontSize}
                    setFontSize={(newSize) => {
                        setFontSize(newSize);
                        if (collageId) {
                            updateCollageTitleProperties(collageId, { titleFontSize: newSize })
                                .catch(error => {
                                    console.error("Error actualizando el tamaño de fuente:", error);
                                });
                        }
                    }}
                    fontFamily={fontFamily}
                    setFontFamily={(newFamily) => {
                        setFontFamily(newFamily);
                        if (collageId) {
                            updateCollageTitleProperties(collageId, { titleFontFamily: newFamily })
                                .catch(error => {
                                    console.error("Error actualizando la familia de fuente:", error);
                                });
                        }
                    }}
                    color={color}
                    setColor={(newColor) => {
                        setColor(newColor);
                        if (collageId) {
                            updateCollageTitleProperties(collageId, { titleColor: newColor })
                                .catch(error => {
                                    console.error("Error actualizando el color:", error);
                                });
                        }
                    }}
                />
            )}
        </>
    );
};

export default DraggableTitle;
