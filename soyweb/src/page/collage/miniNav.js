// MiniNav.js

import React from 'react';
import './MiniNav.css';

const MiniNav = ({ isCreatingCollage, setIsCreatingCollage, onToggleCollagesList }) => {
  const handleCreateCollage = () => {
    setIsCreatingCollage(!isCreatingCollage); // Cambiar el estado de creación
  };

  const handleListCollages = () => {
    if (onToggleCollagesList) {
      onToggleCollagesList();
    }
  };

  return (
    <div className="mini-nav">
      <button onClick={handleCreateCollage}>
        {isCreatingCollage ? 'Cancelar Crear Collage' : 'Crear Nuevo Collage'}
      </button>
      <button onClick={handleListCollages}>Listar Collages</button> {/* Botón actualizado */}
    </div>
  );
};

export default MiniNav;
