// MainLayout.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../firebase';
import TopBar from './TopBar';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import GroupIcon from '@mui/icons-material/Group';
import InboxIcon from '@mui/icons-material/Inbox';
import BugReportIcon from '@mui/icons-material/BugReport';
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
            <NavLink to="/dashboard">
              <HomeIcon className="icon" />
              <span className="sidebar-number">|</span> Dashboard
            </NavLink>
            <NavLink to="/entradas">
              <ListAltIcon className="icon" />
              <span className="sidebar-number">|</span> Gestión de Entradas
            </NavLink>
            <NavLink to="/monitor/graphics">
              <BarChartIcon className="icon" />
              <span className="sidebar-number">|</span> Ver Gráficos
            </NavLink>
            <NavLink to="/system/notifications">
              <NotificationsIcon className="icon" />
              <span className="sidebar-number">|</span> Notificaciones
            </NavLink>
            <NavLink to="/monitor/SoulmatePage">
              <MusicNoteIcon className="icon" />
              <span className="sidebar-number">|</span> Lista de Emociones y Canciones
            </NavLink>
            <NavLink to="/test">
              <BugReportIcon className="icon" />
              <span className="sidebar-number">|</span> Página de Testeo
            </NavLink>
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
