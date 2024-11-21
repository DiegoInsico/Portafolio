import React from "react";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import "./TopBar.css";

const TopBar = ({ currentUser, handleLogout }) => {
  return (
    <header className="topbar-container">
      {/* Usuario */}
      <div className="topbar-user">
        <FaUserCircle className="topbar-user-icon" />
        <span className="topbar-user-name">{currentUser?.displayName || "Invitado"}</span>
      </div>

      {/* Título */}
      <h1 className="topbar-title">Soy</h1>

      {/* Botón de Cerrar Sesión */}
      <button onClick={handleLogout} className="topbar-logout-btn">
        <FaSignOutAlt className="topbar-logout-icon" />
        <span className="topbar-logout-text">Cerrar sesión</span>
      </button>
    </header>
  );
};

export default TopBar;
