import React from 'react';
import './MiniNav.css';

const MiniNav = ({ onToggleCollagesList, onStartCreatingCollage }) => {

  const handleCreateCollage = () => {
    // Llamamos a la función del padre para crear el borrador y activar el modo creación
    if (onStartCreatingCollage) {
      onStartCreatingCollage();
    }
  };

  const handleListCollages = () => {
    if (onToggleCollagesList) {
      onToggleCollagesList();
    }
  };

  return (
    <div className="mini-nav">
      <button onClick={handleCreateCollage}>
        Crear Nuevo Collage
      </button>
      <button onClick={handleListCollages}>Listar Collages</button>
    </div>
  );
};

export default MiniNav;
