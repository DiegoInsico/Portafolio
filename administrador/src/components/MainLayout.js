import React from "react";
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
} from "@mui/icons-material";
import "./mainLayout.css";

const MainLayout = ({ children, isAuthenticated, currentUser }) => {
  const handleLogout = () => {
    auth.signOut().catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
  };

  return (
    <div className="main-layout-container">
      {isAuthenticated ? (
        <>
          {/* Barra superior */}
          <TopBar currentUser={currentUser} handleLogout={handleLogout} />

          <div className="main-layout-wrapper">
            {/* Barra lateral izquierda */}
            <aside className="main-layout-sidebar">
              <h2 className="main-layout-title">Navegación</h2>
              <nav className="main-layout-nav">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <Home className="main-layout-icon" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/entradas"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <ListAlt className="main-layout-icon" />
                  Datos de Entradas
                </NavLink>
                <NavLink
                  to="/monitor/graphics"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <BarChart className="main-layout-icon" />
                  Ver Gráficos
                </NavLink>
                <NavLink
                  to="/monitor/SoulmatePage"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <MusicNote className="main-layout-icon" />
                  Lista de Emociones y Canciones
                </NavLink>
                <NavLink
                  to="/test"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <BugReport className="main-layout-icon" />
                  Página de Testeo
                </NavLink>
                <NavLink
                  to="/monitor/users/userActivity"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <People className="main-layout-icon" />
                  Gestión de Usuarios
                </NavLink>
                <NavLink
                  to="/system/inbox"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <Inbox className="main-layout-icon" />
                  Consultas y Soporte
                </NavLink>
                <NavLink
                  to="/rol/RolManagment"
                  className={({ isActive }) =>
                    `main-layout-link ${isActive ? "main-layout-link-active" : ""}`
                  }
                >
                  <ManageAccounts className="main-layout-icon" />
                  Administración de Usuarios
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
  );
};

export default MainLayout;
