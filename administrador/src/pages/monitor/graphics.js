import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; // Asegúrate de tener configurado Firebase
import { collection, getDocs, query, where } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; // Importar el tipo de Timestamp
import Container from "../../components/container";

const Graphics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0, // Nueva métrica para la actividad diaria de inicio de sesión
  });

  // Función para convertir el Timestamp de Firestore a una fecha legible
  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate(); // Convertir a objeto de fecha
      return date.toLocaleString(); // Formatear a una cadena legible
    }
    return "Fecha no disponible"; // Manejar casos sin fecha válida
  };

  // Función para obtener datos de Firestore
  const fetchData = async () => {
    try {
      // Consultar la colección de usuarios activos
      const usersSnapshot = await getDocs(collection(db, "users"));
      const activeUsers = usersSnapshot.size; // Contar el número de usuarios

      // Obtener la última actividad desde 'entradas'
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      let lastActivity = "";
      let entriesUploaded = 0;

      entriesSnapshot.forEach((doc) => {
        const data = doc.data();
        entriesUploaded++; // Incrementar el total de entradas
        if (!lastActivity || data.fechaCreacion > lastActivity) {
          lastActivity = data.fechaCreacion; // Actualizar la última actividad
        }
      });

      // Obtener el número de usuarios que han iniciado sesión hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Establecer la fecha al comienzo del día

      const sessionsQuery = query(
        collection(db, "sessions"),
        where("timestamp", ">=", Timestamp.fromDate(today)) // Filtrar sesiones desde el inicio del día actual
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);
      const dailyUserActivity = sessionsSnapshot.size; // Número de usuarios que han iniciado sesión hoy

      // Actualizar las estadísticas en el estado
      setStats({
        activeUsers,
        lastActivity: formatDate(lastActivity), // Usar la función para formatear el Timestamp
        entriesUploaded,
        dailyUserActivity, // Actualizar el valor de actividad diaria
      });
    } catch (error) {
      console.error("Error obteniendo datos de Firebase:", error);
    }
  };

  useEffect(() => {
    fetchData(); // Llamar a la función cuando el componente se monte
  }, []);

  return (
    <Container>
      <div className="dashboard-container">
        <h1>Estadísticas y Gráficos</h1>

        {/* Mostrar estadísticas generales */}
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Usuarios Activos</h3>
            <div className="number-display">{stats.activeUsers}</div>
            <p className="description">
              Usuarios actualmente activos en el sistema
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Última Actividad</h3>
            <div className="number-display">{stats.lastActivity}</div>
            <p className="description">
              Hora de la última actividad registrada
            </p>
          </div>
          <div className="dashboard-card">
            <h3>Entradas Subidas</h3>
            <div className="number-display">{stats.entriesUploaded}</div>
            <p className="description">Total de entradas subidas hoy</p>
          </div>
          <div className="dashboard-card">
            <h3>Actividad Diaria de Usuarios</h3>
            <div className="number-display">{stats.dailyUserActivity}</div>
            <p className="description">Usuarios que han iniciado sesión hoy</p>
          </div>
        </div>

        {/* Botones para navegar por el monitoreo */}
        <div className="settings-section">
          <h3>Monitor de Sistema</h3>
          <div className="dashboard-grid">
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
