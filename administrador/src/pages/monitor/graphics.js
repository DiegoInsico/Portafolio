import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import Container from "../../components/container";
import "./styles.css"; // Importa el archivo de estilos

const Graphics = () => {
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
      <div className="graph-container">
        <h1>Estadísticas y Gráficos</h1>

        <div className="graph-grid">
          <div className="graph-card">
            <h3>Usuarios Activos</h3>
            <p className="graph-value">{stats.activeUsers}</p>
          </div>
          <div className="graph-card">
            <h3>Última Actividad</h3>
            <p className="graph-value">{stats.lastActivity}</p>
          </div>
          <div className="graph-card">
            <h3>Entradas Subidas</h3>
            <p className="graph-value">{stats.entriesUploaded}</p>
          </div>
          <div className="graph-card">
            <h3>Actividad Diaria</h3>
            <p className="graph-value">{stats.dailyUserActivity}</p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Monitor de Sistema</h3>
          <div className="graph-grid">
            <button
              className="update-button"
              onClick={() => navigate("/monitor/graphs/usageCharts")}
            >
              Ver Gráficos de Uso
            </button>
            <button
              className="update-button"
              onClick={() => navigate("/monitor/storage/storageUsage")}
            >
              Ver Uso de Almacenamiento
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Graphics;
