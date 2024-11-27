import React, { useEffect, useState } from "react";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../../../firebase";
import "./css/info.css";

const Info = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });
  const [selectedModal, setSelectedModal] = useState(null);

  const closeModal = () => {
    setSelectedModal(null);
  };

  const formatDate = (timestamp) => {
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return date.toLocaleString();
    }
    return "Fecha no disponible";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const entriesSnapshot = await getDocs(collection(db, "entradas"));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeUsers = usersSnapshot.size;
        const entriesUploaded = entriesSnapshot.size;
        const dailyUserActivity = entriesSnapshot.docs.filter((entry) => {
          const entryDate = entry.data().fechaCreacion?.toDate();
          return entryDate >= today;
        }).length;

        let lastActivity = "";
        entriesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!lastActivity || data.fechaCreacion > lastActivity) {
            lastActivity = data.fechaCreacion;
          }
        });

        setStats({
          activeUsers,
          entriesUploaded,
          dailyUserActivity,
          lastActivity: formatDate(lastActivity),
        });
      } catch (error) {
        console.error("Error obteniendo datos de Firebase:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="info-container">
      <h1 className="info-title">Información</h1>
      <div className="info-cards">
        <div className="info-card" onClick={() => setSelectedModal("activeUsers")}>
          <h3>Usuarios Activos</h3>
          <p>{stats.activeUsers}</p>
        </div>
        <div className="info-card" onClick={() => setSelectedModal("entriesUploaded")}>
          <h3>Entradas Subidas</h3>
          <p>{stats.entriesUploaded}</p>
        </div>
        <div className="info-card" onClick={() => setSelectedModal("dailyUserActivity")}>
          <h3>Actividad Diaria</h3>
          <p>{stats.dailyUserActivity}</p>
        </div>
        <div className="info-card" onClick={() => setSelectedModal("lastActivity")}>
          <h3>Última Actividad</h3>
          <p>{stats.lastActivity}</p>
        </div>
      </div>

      {selectedModal && (
        <div className="info-modal">
          <div className="info-modal-content">
            <button className="info-modal-close" onClick={closeModal}>
              Cerrar
            </button>
            <h2>{selectedModal}</h2>
            <p>Contenido del modal en blanco.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Info;
