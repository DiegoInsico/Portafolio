// TopBar.js
import React from 'react';
import './TopBar.css';

const TopBar = ({ currentUser, handleLogout }) => {
  return (
    <div className="topbar">
      <span className="topbar-user">{currentUser?.displayName || "Invitado"}</span>
      <h1 className="topbar-title"><i>Soy</i></h1>
      <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
    </div>
  );
};

export default TopBar;
