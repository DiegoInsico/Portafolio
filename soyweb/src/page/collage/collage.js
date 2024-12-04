// Collage.js

import React, { useState, useEffect, useRef } from 'react';
import { getEntradas } from '../../firebase';
import DraggableEntry from './draggableEntry';
import DraggableTitle from './draggableTitle'; // Importa el nuevo componente
import './Collage.css';

const Collage = ({ currentUser, selectedEntries, collageName, setCollageName, collageId, titleData }) => {
    const [entriesInCollage, setEntriesInCollage] = useState([]);
    const workspaceRef = useRef(null); // Referencia al contenedor
    const [highestZIndex, setHighestZIndex] = useState(1); // Estado para manejar el z-index

    useEffect(() => {
        const fetchSelectedEntries = async () => {
            const allEntries = await getEntradas(currentUser.uid);
            // Filtrar solo las entradas seleccionadas
            const selectedEntriesData = allEntries.filter(entry => selectedEntries.includes(entry.id));
            setEntriesInCollage(selectedEntriesData);
        };

        if (currentUser && selectedEntries.length > 0) {
            fetchSelectedEntries();
        } else {
            setEntriesInCollage([]);
        }
    }, [currentUser, selectedEntries]);

    // Función para incrementar y obtener el siguiente z-index
    const bringToFront = () => {
        setHighestZIndex(prev => prev + 1);
        return highestZIndex + 1;
    };

    return (
        <div className="collage-creation-container">
            <div className="collage-workspace" ref={workspaceRef}>
                {/* Renderiza el título draggable */}
                <DraggableTitle
                    title={collageName}
                    setTitle={setCollageName}
                    containerRef={workspaceRef}
                    collageId={collageId} // Pasa collageId si está disponible
                    titleData={titleData} // Pasa titleData si está disponible
                    bringToFront={bringToFront} // Pasa la función para manejar el z-index
                />

                {entriesInCollage.map(entry => (
                    <DraggableEntry
                        key={entry.id}
                        entry={entry}
                        initialPosition={{ x: 100, y: 100 }}
                        containerRef={workspaceRef}
                        bringToFront={bringToFront} // Opcional: si DraggableEntry también necesita manejar z-index
                    />
                ))}
            </div>
        </div>
    );
};

export default Collage;
