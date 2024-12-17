import React from 'react';
import './MiniNav.css';

const MiniNav = ({ onToggleCollagesList, onStartCreatingCollage }) => {

  const handleCreateCollage = () => {
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
        Crear un Nuevo Pensadero
      </button>
      <button onClick={handleListCollages}>Lista de Pensaderos</button>
    </div>
  );
};

export default MiniNav;
