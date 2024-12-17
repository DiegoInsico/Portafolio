// src/album/MiniNav.jsx

import React from 'react';
import './MiniNav.css';

const MiniNav = ({ activeOption, handleOptionClick }) => {
    return (
        <nav className="mini-nav">
            <ul className="nav-options">
                <li
                    className={`nav-option ${activeOption === 'crearAlbum' ? 'active' : ''}`}
                    onClick={() => handleOptionClick('crearAlbum')}
                >
                    Crear Collage
                </li>
                <li
                    className={`nav-option ${activeOption === 'tusAlbums' ? 'active' : ''}`}
                    onClick={() => handleOptionClick('tusAlbums')}
                >
                    Tus Collages
                </li>
                <li
                    className={`nav-option ${activeOption === 'compartidosContigo' ? 'active' : ''}`}
                    onClick={() => handleOptionClick('compartidosContigo')}
                >
                    Collages Compartidos
                </li>
            </ul>
        </nav>
    );
};

export default MiniNav;
