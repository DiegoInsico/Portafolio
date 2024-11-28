// src/components/PasswordOverlay.js

import React, { useState } from 'react';
import './PasswordOverlay.css'; // Asegúrate de importar el CSS

const PasswordOverlay = ({ level, onClose, onSuccess, correctPassword }) => {
  const [inputPassword, setInputPassword] = useState('');

  const handleSubmit = () => {
    if (inputPassword === correctPassword) {
      onSuccess();
      onClose();
    } else {
      alert('Contraseña incorrecta');
    }
  };

  return (
    <div className="password-overlay">
      <div className="password-overlay-content">
        <div className="password-overlay-header">
          <h2>Introduce la contraseña para el nivel {level}</h2>
        </div>
        <div className="password-overlay-form">
          <input
            type="password"
            placeholder="Contraseña"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
          />
        </div>
        <div className="password-overlay-buttons">
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordOverlay;
