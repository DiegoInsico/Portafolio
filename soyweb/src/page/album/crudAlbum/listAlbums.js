// src/album/ListAlbums.jsx

import React from 'react';
import './ListAlbums.css';

const ListAlbums = ({ albums, onDelete }) => {
    return (
        <div className="list-albums-container">
            <h2>Listado de Álbumes</h2>
            {albums.length === 0 ? (
                <p>No tienes álbumes aún.</p>
            ) : (
                <ul className="albums-list-content">
                    {albums.map(album => (
                        <li key={album.id} className="album-item-content">
                            <span>{album.name}</span>
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

export default ListAlbums;
