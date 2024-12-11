import React, { useRef, useState } from 'react';
import DraggableEntry from './draggableEntry';
import DraggableTitle from './draggableTitle';
import './Collage.css';

const CollageViewer = ({ collageName, titleData, entries, collageId }) => {
    const workspaceRef = useRef(null);
    const [highestZIndex, setHighestZIndex] = useState(1);
    console.log(titleData)

    const bringToFront = () => {
        setHighestZIndex(prev => prev + 1);
        return highestZIndex + 1;
    };

    return (
        <div className="collage-creation-container">
            <div className="collage-workspace" ref={workspaceRef}>
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
                    />
                ))}
            </div>
        </div>
    );
};

export default CollageViewer;
