// src/album/SideMenu.jsx

import React from 'react';
import './SideMenu.css';

const SideMenu = ({ isExpanded, toggleMenu, activeOption, handleOptionClick }) => {
    return (
        <aside className={`side-menu ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <button
                className="toggle-menu-button"
                onClick={toggleMenu}
            >
                {isExpanded ? 'Cerrar Menú' : '☰'}
            </button>
            {isExpanded && (
                <nav className="menu-options">
                    <button
                        className={`menu-option ${activeOption === 'crearAlbum' ? 'active' : ''}`}
                        onClick={() => handleOptionClick('crearAlbum')}
                    >
                        Crear Álbum
                    </button>
                    <button
                        className={`menu-option ${activeOption === 'listarAlbums' ? 'active' : ''}`}
                        onClick={() => handleOptionClick('listarAlbums')}
                    >
                        Listar Álbumes
                    </button>
                    <button
                        className={`menu-option ${activeOption === 'tusAlbums' ? 'active' : ''}`}
                        onClick={() => handleOptionClick('tusAlbums')}
                    >
                        Tus Álbumes
                    </button>
                </nav>
            )}
        </aside>
    );
};

export default SideMenu;
