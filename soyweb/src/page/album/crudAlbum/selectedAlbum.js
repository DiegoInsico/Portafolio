// src/album/SelectedAlbum.jsx

import React from 'react';
import './SelectedAlbum.css';

const SelectedAlbum = ({ albums, onSelect }) => {
    return (
        <div className="selected-albums-container">
            <h2>Tus Álbumes</h2>
            {albums.length === 0 ? (
                <p>No tienes álbumes aún.</p>
            ) : (
                <ul className="albums-list-content">
                    {albums.map(album => (
                        <li key={album.id} className="album-item-content">
                            <button
                                className="album-button-content"
                                onClick={() => onSelect(album)}
                            >
                                {album.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SelectedAlbum;
