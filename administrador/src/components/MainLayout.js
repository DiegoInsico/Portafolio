import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase";
import TopBar from "./TopBar";
import {
  Home,
  ListAlt,
  BarChart,
  MusicNote,
  BugReport,
  People,
  Inbox,
  ManageAccounts,
  Menu,
} from "@mui/icons-material";
import "./mainLayout.css";

const MainLayout = ({ children, isAuthenticated, currentUser }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    auth.signOut().catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`main-layout ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="main-layout-container">
        {isAuthenticated ? (
          <>
            {/* Barra superior */}
            <TopBar currentUser={currentUser} handleLogout={handleLogout} />

            <div className="main-layout-wrapper">
              {/* Barra lateral izquierda */}
              <aside
                className={`main-layout-sidebar ${
                  isSidebarCollapsed ? "collapsed" : ""
                }`}
              >
                <button
                  className="sidebar-toggle-btn"
                  onClick={toggleSidebar}
                  title={isSidebarCollapsed ? "Expandir" : "Colapsar"}
                >
                  <Menu />
                </button>
                <h2 className="main-layout-title">
                  {!isSidebarCollapsed && "Navegación"}
                </h2>
                <nav className="main-layout-nav">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Dashboard"
                  >
                    <Home className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Dashboard</span>}
                  </NavLink>
                  <NavLink
                    to="/entradas"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Datos de Entradas"
                  >
                    <ListAlt className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Datos de Entradas</span>}
                  </NavLink>
                  <NavLink
                    to="/monitor/graphics"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Ver Gráficos"
                  >
                    <BarChart className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Ver Gráficos</span>}
                  </NavLink>
                  <NavLink
                    to="/monitor/storage/storageUsage"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Almacenaje"
                  >
                    <BarChart className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Almacenaje</span>}
                  </NavLink>
                  <NavLink
                    to="/monitor/SoulmatePage"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Lista de Emociones y Canciones"
                  >
                    <MusicNote className="main-layout-icon" />
                    {!isSidebarCollapsed && (
                      <span>Lista de Emociones y Canciones</span>
                    )}
                  </NavLink>
                  <NavLink
                    to="/test"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Página de Testeo"
                  >
                    <BugReport className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Página de Testeo</span>}
                  </NavLink>
                  <NavLink
                    to="/system/inbox"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Consultas y Soporte"
                  >
                    <Inbox className="main-layout-icon" />
                    {!isSidebarCollapsed && <span>Consultas y Soporte</span>}
                  </NavLink>
                  <NavLink
                    to="/rol/RolManagment"
                    className={({ isActive }) =>
                      `main-layout-link ${
                        isActive ? "main-layout-link-active" : ""
                      }`
                    }
                    title="Administración de Usuarios"
                  >
                    <ManageAccounts className="main-layout-icon" />
                    {!isSidebarCollapsed && (
                      <span>Administración de Usuarios</span>
                    )}
                  </NavLink>
                </nav>
              </aside>

              {/* Contenido principal */}
              <main className="main-layout-content">{children}</main>
            </div>
          </>
        ) : (
          <div className="main-layout-login">{children}</div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
