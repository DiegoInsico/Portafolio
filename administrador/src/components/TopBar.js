import React from "react";
import "./TopBar.css";

const TopBar = ({ currentUser, handleLogout }) => {
  return (
    <header className="topbar-container">
      {/* Usuario */}
      <div className="topbar-user">
        <span>
          {currentUser?.isAdmin
            ? `Administrador actual: ${currentUser.displayName}`
            : currentUser?.displayName || "Invitado"}
        </span>
      </div>

      {/* Título */}
      <h1>Sistema de Gestión</h1>

      {/* Botón de Cerrar Sesión */}
      <button onClick={handleLogout} className="button-secondary">
        Cerrar sesión
      </button>
    </header>
  );
};

export default TopBar;
