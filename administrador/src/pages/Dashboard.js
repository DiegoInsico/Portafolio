import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Ya tienes un archivo de estilos general

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>Panel de Administración</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate("/entradas")}>
          <h3>Gestión de Entradas</h3>
          <p className="description">Gestiona las entradas registradas.</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/monitor/users/userActivity")}>
          <h3>Gestión de Usuarios</h3>
          <p className="description">Administra los usuarios de la plataforma.</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/monitor/graphics")}>
          <h3>Ver Gráficos</h3>
          <p className="description">Revisa las estadísticas de uso.</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/system/notifications")}>
          <h3>Notificaciones</h3>
          <p className="description">Sistema de notificaciones y alertas.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

