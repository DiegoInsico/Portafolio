import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Archivo de estilos actualizado

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <h1>Panel de Administración</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate("/entradas")}>
          <span className="initial-text">Gestión de Entradas</span>
          <span className="hover-text">Gestiona las entradas registradas.</span>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/monitor/users/userActivity")}>
          <span className="initial-text">Gestión de Usuarios</span>
          <span className="hover-text">Administra los usuarios de la plataforma.</span>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/monitor/graphics")}>
          <span className="initial-text">Ver Gráficos</span>
          <span className="hover-text">Revisa las estadísticas de uso.</span>
        </div>
        <div className="dashboard-card" onClick={() => navigate("/system/notifications")}>
          <span className="initial-text">Notificaciones</span>
          <span className="hover-text">Sistema de notificaciones y alertas.</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
