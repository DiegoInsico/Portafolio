import React, { useRef, useState } from 'react';
import DraggableEntry from './draggableEntry';
import DraggableTitle from './draggableTitle';
import EntryInfoPanel from '../entry/entryInfoPanel';
import './Collage.css';

const CollageViewer = ({ collageName, titleData, entries, collageId, currentUser }) => {
    const workspaceRef = useRef(null);
    const [highestZIndex, setHighestZIndex] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState(null);
    console.log(titleData)

    const bringToFront = () => {
        setHighestZIndex(prev => prev + 1);
        return highestZIndex + 1;
    };
    const handleEntryClick = (entry) => {
        setSelectedEntry(entry); // Actualiza la entrada seleccionada
    };
    const handleWorkspaceClick = (e) => {
        if (e.target.classList.contains("collage-workspace")) {
            setSelectedEntry(null);
        }
    };

    return (
        <div className="collage-viewer-container">
            <div className="collage-workspace" ref={workspaceRef} onClick={handleWorkspaceClick}>
                <DraggableTitle
                    title={collageName}
                    titleData={titleData}
                    disabled={true}
                />

                {entries && entries.map(entry => (
                    <DraggableEntry
                        key={entry.entryId || entry.id}
                        entry={entry}
                        disabled={true}
                        onClick={() => handleEntryClick(entry)} // Se pasa la función onClick
                    />
                ))}
            </div>
            {selectedEntry && <EntryInfoPanel currentUser={currentUser} selectedEntry={selectedEntry} />}
        </div>
    );
};

export default CollageViewer;
