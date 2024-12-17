import React, { useState, useEffect, useRef } from 'react';
import { getEntradas } from '../../firebase';
import DraggableEntry from './draggableEntry';
import DraggableTitle from './draggableTitle';
import './Collage.css';

const Collage = ({
    currentUser,
    selectedEntries,
    collageName,
    setCollageName,
    collageId,
    titleData,
    isPreview,
    ownerId,
    onTitleDataChange,
    onEntriesChange,
    isSaving
}) => {
    const [entriesInCollage, setEntriesInCollage] = useState([]);
    const [localTitleData, setLocalTitleData] = useState(titleData);
    const workspaceRef = useRef(null);
    const [highestZIndex, setHighestZIndex] = useState(1);

    // Notificar cambios en las entradas
    useEffect(() => {

        onEntriesChange(entriesInCollage);
        console.log("DEBUG [Collage]: entriesInCollage actualizadas", entriesInCollage);
    }, [entriesInCollage, onEntriesChange]);

    // Notificar cambios en el título
    useEffect(() => {
        onTitleDataChange(localTitleData);
    }, [localTitleData, onTitleDataChange]);

    useEffect(() => {
        const loadEntries = async () => {
            if (isPreview) {
                // Vista previa: ya se tienen las entradas con sus props
                setEntriesInCollage(selectedEntries || []);
            } else {
                // Creación: Fusionar datos base de las entradas con las props temporales
                if (!ownerId || selectedEntries.length === 0) {
                    setEntriesInCollage([]);
                    return;
                }

                const allEntries = await getEntradas(ownerId);
                const entriesWithProps = selectedEntries.map(selected => {
                    const entryData = allEntries.find(e => e.id === selected.entryId);
                    if (entryData) {
                        return {
                            ...entryData,
                            entryId: selected.entryId,
                            position: selected.position,
                            size: selected.size,
                            backgroundColor: selected.backgroundColor,
                        };
                    }
                    return null;
                }).filter(e => e !== null);

                setEntriesInCollage(entriesWithProps);
            }
        };

        loadEntries();
    }, [ownerId, selectedEntries, isPreview]);

    const bringToFront = () => {
        setHighestZIndex(prev => prev + 1);
        return highestZIndex + 1;
    };

    // Función para actualizar las propiedades del título
    const updateTitleProperties = (newProps) => {
        setLocalTitleData(prev => ({ ...prev, ...newProps }));
    };

    // Función para actualizar las propiedades de una entrada
    const updateEntryProperties = (entryId, newProps) => {
        setEntriesInCollage(prevEntries =>
            prevEntries.map(entry =>
                entry.entryId === entryId
                    ? { ...entry, ...newProps }
                    : entry
            )
        );
    };

    return (
        <div className="collage-creation-container">
            <div className="collage-workspace" ref={workspaceRef}>
                <DraggableTitle
                    title={collageName}
                    setTitle={setCollageName}
                    containerRef={workspaceRef}
                    collageId={collageId}
                    titleData={localTitleData}
                    bringToFront={bringToFront}
                    disabled={isPreview || isSaving}
                    onTitlePropertiesChange={updateTitleProperties}
                />

                {entriesInCollage.map(entry => (
                    <DraggableEntry
                        key={entry.entryId || entry.id}
                        entry={entry}
                        collageId={collageId}
                        containerRef={workspaceRef}
                        bringToFront={bringToFront}
                        disabled={isPreview || isSaving}
                        onEntryPropertiesChange={updateEntryProperties}
                    />
                ))}
            </div>
        </div>
    );
};

export default Collage;
