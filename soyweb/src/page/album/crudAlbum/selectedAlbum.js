// src/album/crudAlbum/SelectedAlbum.jsx

import React from 'react';
import './SelectedAlbum.css';

const SelectedAlbum = ({ albums, onSelect, onDelete }) => {
    return (
        <div className="selected-albums-container">
            <h2>Tus Collages</h2>
            {albums.length === 0 ? (
                <p>No tienes collages aún.</p>
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
                            <button
                                className="delete-album-button-content"
                                onClick={() => onDelete(album.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SelectedAlbum;
