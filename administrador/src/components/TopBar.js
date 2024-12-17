import React from "react";
import { NavLink } from "react-router-dom";
import "./TopBar.css";

const TopBar = ({ currentUser, userRole, handleLogout }) => {
  const renderNavigation = () => {
    switch (userRole) {
      case "Administrador":
        return (
          <>
            <NavLink to="/dashboard" className="topbar-link">
              Dashboard
            </NavLink>
            {/* <NavLink to="/Alertas" className="topbar-link">
              Alertas
            </NavLink> */}
            <NavLink to="/monitor/graphics" className="topbar-link">
              Gráficos Tipificados
            </NavLink>
            {/* <NavLink to="/monitor/storage/storageUsage" className="topbar-link">
              Gráficos Masivos
            </NavLink> */}
            <NavLink to="/monitor/pb/pb" className="topbar-link">
              Gráficos PB
            </NavLink>
            <NavLink to="/monitor/graphs/userHeatmap" className="topbar-link">
              Mapa de Usuarios
            </NavLink>
            <NavLink to="/system/inbox" className="topbar-link">
              Consultas y Soporte
            </NavLink>
            {/* <NavLink to="/monitor/clouster" className="topbar-link">
              Logs
            </NavLink> */}
            {/* <NavLink to="/rol/RolManagment" className="topbar-link">
              Administración de Usuarios
            </NavLink> */}
            {/* <NavLink to="/test/test" className="topbar-link">
              Test
            </NavLink> */}
          </>
        );
      case "Operador":
        return (
          <>
            <NavLink to="/dashboard" className="topbar-link">
              Dashboard
            </NavLink>
            <NavLink to="/system/inbox" className="topbar-link">
              Consultas y Soporte
            </NavLink>
            <NavLink to="/monitor/clouster" className="topbar-link">
              Clouster
            </NavLink>
          </>
        );
      case "Analista":
        return (
          <>
            <NavLink to="/monitor/graphics" className="topbar-link">
              Gráficos Tipificados
            </NavLink>
            <NavLink to="/monitor/pb/pb" className="topbar-link">
              Analisis de usuarios
            </NavLink>
            <NavLink to="/monitor/storage/storageUsage" className="topbar-link">
              Gráficos Masivos
            </NavLink>
            <NavLink to="/monitor/graphs/userHeatmap" className="topbar-link">
              Mapa de Usuarios
            </NavLink>
          </>
        );
      default:
        return <span>No tienes acceso a ninguna funcionalidad.</span>;
    }
  };

  return (
    <header className="topbar-container">
      {/* Información del Usuario */}
      <div className="topbar-user">
        <span>
          {currentUser
            ? `${userRole || "Sin rol"} ${currentUser.displayName || "Usuario"} `
            : "No autenticado"}
        </span>
      </div>

      {/* Navegación */}
      <nav className="topbar-nav">{renderNavigation()}</nav>

      {/* Botón de Cerrar Sesión */}
      <button onClick={handleLogout} className="button-secondary">
        Cerrar sesión
      </button>
    </header>
  );
};

export default TopBar;
