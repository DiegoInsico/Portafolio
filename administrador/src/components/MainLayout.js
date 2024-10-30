// MainLayout.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../firebase';
import TopBar from './TopBar';
import './mainLayout.css';

const MainLayout = ({ children, isAuthenticated, currentUser }) => {
  const handleLogout = () => {
    auth.signOut().catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
  };

  return (
    <div className="main-layout">
      {isAuthenticated ? (
        <>
          <TopBar currentUser={currentUser} handleLogout={handleLogout} />
          <div className="sidebar">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/entradas">Gestión de Entradas</NavLink>
            <NavLink to="/monitor/users/userActivity">Gestión de Usuarios</NavLink>
            <NavLink to="/monitor/graphics">Ver Gráficos</NavLink>
            <NavLink to="/system/notifications">Notificaciones</NavLink>
            <NavLink to="/monitor/SoulmatePage">Almas gemelas</NavLink>
            <NavLink to="/system/inbox">Consultas</NavLink>
          </div>
          <div className="content">
            {children}
          </div>
        </>
      ) : (
        <div className="login-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default MainLayout;
