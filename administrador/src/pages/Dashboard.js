import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Archivo de estilos actualizado
import Container from "../components/container";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";

const Dashboard = () => {
  
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleString();
    }
    return "Fecha no disponible";
  };

  const fetchData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const activeUsers = usersSnapshot.size;

      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      let lastActivity = "";
      let entriesUploaded = 0;

      entriesSnapshot.forEach((doc) => {
        const data = doc.data();
        entriesUploaded++;
        if (!lastActivity || data.fechaCreacion > lastActivity) {
          lastActivity = data.fechaCreacion;
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sessionsQuery = query(
        collection(db, "sessions"),
        where("timestamp", ">=", Timestamp.fromDate(today))
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const dailyUserActivity = sessionsSnapshot.size;

      setStats({
        activeUsers,
        lastActivity: formatDate(lastActivity),
        entriesUploaded,
        dailyUserActivity,
      });
    } catch (error) {
      console.error("Error obteniendo datos de Firebase:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <div className="dashboard-content">
          <div className="notifi-area">
            <h1>notificaciones por responder</h1>
            <p>soy un usuario molesto</p>
            <p>soy un usuario molesto</p>
            <p>soy un usuario molesto</p>
            <p>soy un usuario molesto</p> 
            <p>soy un usuario molesto</p> 
            <p>soy un usuario molesto</p> 
          </div>
          <div className="dash-music">
            <h1>seria el artista mas escuhcado segun los usuarios</h1>
          </div>
          <div className="dashboard-grid">
            <div className="simple-card">
              <h3>Usuarios Activos</h3>
              <p className="simple-value">{stats.activeUsers}</p>
            </div>
            <div className="simple-card">
              <h3>Última Actividad</h3>
              <p className="simple-value">{stats.lastActivity}</p>
            </div>
            <div className="simple-card">
              <h3>Entradas Subidas</h3>
              <p className="simple-value">{stats.entriesUploaded}</p>
            </div>
            <div className="simple-card">
              <h3>Actividad Diaria</h3>
              <p className="simple-value">{stats.dailyUserActivity}</p>
            </div>
          </div>
          <div className="dash-col">
            <h1>Información Adicional</h1>
            <p>En este punto debemos introducir estadísticas operativas.</p>
            <p>Artista más escuchado, según información de usuarios.</p>
            <p>Emoción más fuerte del mes.</p>
            <p>Separación lateral: | Gestión de usuarios y consultorías | Gráficos y estadísticas.</p>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
