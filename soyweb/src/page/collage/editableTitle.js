// EditableTitle.js

import React, { useState } from 'react';
import './EditableTitle.css';

const EditableTitle = ({ title, setTitle }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);

    const handleBlur = () => {
        setIsEditing(false);
        setTitle(tempTitle);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            setTitle(tempTitle);
        }
    };

    return (
        <div className="editable-title">
            {isEditing ? (
                <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="title-input"
                />
            ) : (
                <h1 onClick={() => setIsEditing(true)} className="title-display">
                    {title || 'Nombre del collage'}
                </h1>
            )}
        </div>
    );
};

export default EditableTitle;
