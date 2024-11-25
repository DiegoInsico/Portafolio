// 
// 
// 
// 
// 
// ESTE SOLO TIENE LOS GRAFICOS FLOTANTES
// 
// 
// 
// 
// 
// 

import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import Container from "../../components/container";
import { collection, getDocs, query, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import UserHeatmap from "../monitor/graphs/userHeatmap";
import ModalDash from "../modalDash";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });
  const [modalData, setModalData] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);

  const closeModal = () => {
    setSelectedModal(null);
    setModalData(null);
  };

  const calculateAgeAndZodiac = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    const zodiacSigns = [
      "Capricornio",
      "Acuario",
      "Piscis",
      "Aries",
      "Tauro",
      "Géminis",
      "Cáncer",
      "Leo",
      "Virgo",
      "Libra",
      "Escorpio",
      "Sagitario",
    ];
    const zodiacDates = [
      19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21,
    ];

    const month = birth.getMonth();
    const day = birth.getDate();
    const zodiac =
      day > zodiacDates[month] ? zodiacSigns[month + 1] : zodiacSigns[month];

    return { age, zodiac };
  };

  const fetchDashboardData = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));

      const activeUsers = usersSnapshot.size;
      const entriesUploaded = entriesSnapshot.size;

      const last24Hours = new Date();
      last24Hours.setDate(last24Hours.getDate() - 1);

      const dailyUserActivity = entriesSnapshot.docs.filter((entry) => {
        const entryDate = entry.data().fechaCreacion.toDate();
        return entryDate >= last24Hours;
      }).length;

      let lastActivity = "";
      sessionsSnapshot.forEach((doc) => {
        const rawTimestamp = doc.data().timestamp;
        const sessionTimestamp =
          rawTimestamp instanceof Timestamp
            ? rawTimestamp.toDate()
            : new Date(rawTimestamp);

        if (!lastActivity || sessionTimestamp > lastActivity) {
          lastActivity = sessionTimestamp;
        }
      });

      setStats({
        activeUsers,
        entriesUploaded,
        dailyUserActivity,
        lastActivity: lastActivity ? lastActivity.toLocaleString() : "N/A",
      });
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    }
  };

  const handleModalOpen = async (type) => {
    try {
      switch (type) {
        case "activeUsers": {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const entriesSnapshot = await getDocs(collection(db, "entradas"));

          const userStats = usersSnapshot.docs.map((userDoc) => {
            const user = userDoc.data();
            const { age, zodiac } = calculateAgeAndZodiac(user.birthDate);
            const userEntries = entriesSnapshot.docs.filter(
              (entry) => entry.data().userId === userDoc.id
            );
            return {
              nickname: user.nickname || "Desconocido",
              age,
              zodiac,
              entryCount: userEntries.length,
              location: `${user.city}, ${user.country}`,
            };
          });

          setModalData({
            type,
            data: userStats,
            successCount: userStats.length,
            errorCount: usersSnapshot.size - userStats.length,
          });
          break;
        }

        case "entriesUploaded": {
          const entriesSnapshot = await getDocs(collection(db, "entradas"));

          const categoryCounts = entriesSnapshot.docs.reduce((acc, entryDoc) => {
            const category = entryDoc.data().categoria || "Desconocida";
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {});

          const chartData = Object.entries(categoryCounts).map(([key, value]) => ({
            name: key,
            count: value,
          }));

          setModalData({
            type,
            chartData,
            successCount: chartData.length,
          });
          break;
        }
        case "lastActivity": {
          const sessionsSnapshot = await getDocs(collection(db, "sessions"));
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const usersSnapshot = await getDocs(collection(db, "users"));
        
          const lastSession = sessionsSnapshot.docs.reduce((latest, session) => {
            const rawTimestamp = session.data().timestamp;
            const sessionTimestamp =
              rawTimestamp instanceof Timestamp
                ? rawTimestamp.toDate()
                : new Date(rawTimestamp);
        
            return sessionTimestamp > (latest?.timestamp || 0)
              ? { ...session.data(), timestamp: sessionTimestamp }
              : latest;
          }, null);
        
          if (lastSession) {
            const userId = lastSession.userId;
            const user = usersSnapshot.docs.find((doc) => doc.id === userId)?.data();
            const lastEntry = entriesSnapshot.docs
              .filter((entry) => entry.data().userId === userId)
              .map((entry) => entry.data().categoria)
              .reduce(
                (acc, curr) => ({
                  ...acc,
                  [curr]: (acc[curr] || 0) + 1,
                }),
                {}
              );
        
            const mostFrequentCategory = Object.entries(lastEntry).reduce((a, b) =>
              a[1] > b[1] ? a : b
            );
        
            setModalData({
              type,
              user: user
                ? { location: `${user.city}, ${user.country}`, ...user }
                : "Usuario no encontrado",
              timestamp: lastSession.timestamp.toLocaleString(),
              mostFrequentCategory:
                mostFrequentCategory?.[0] || "Sin categoría disponible",
            });
          } else {
            setModalData({
              type,
              error: "No se encontró información para la última actividad.",
            });
          }
          break;
        }
        

        case "dailyUserActivity": {
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const last24Hours = new Date();
          last24Hours.setDate(last24Hours.getDate() - 1);

          const hourlyActivity = new Array(24).fill(0);

          entriesSnapshot.docs.forEach((entryDoc) => {
            const creationDate = entryDoc.data().fechaCreacion.toDate();
            if (creationDate >= last24Hours) {
              const hour = creationDate.getHours();
              hourlyActivity[hour]++;
            }
          });

          const chartData = hourlyActivity.map((count, index) => ({
            hour: `${index}:00`,
            count,
          }));

          setModalData({
            type,
            chartData,
            successCount: chartData.reduce((acc, obj) => acc + obj.count, 0),
          });
          break;
        }

        default:
          setModalData(null);
      }
      setSelectedModal(type);
    } catch (error) {
      console.error("Error al abrir el modal:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <Container>
      <div className="dashboard-grid">
        <h1 className="dashboard-title">Sistema de Gestión</h1>
        <div className="dashboard-cards">
          <div className="card" onClick={() => handleModalOpen("activeUsers")}>
            Usuarios Activos: {stats.activeUsers}
          </div>
          <div className="card" onClick={() => handleModalOpen("entriesUploaded")}>
            Entradas Subidas: {stats.entriesUploaded}
          </div>
          <div className="card" onClick={() => handleModalOpen("dailyUserActivity")}>
            Actividad Diaria: {stats.dailyUserActivity}
          </div>
          <div className="card" onClick={() => handleModalOpen("lastActivity")}>
            Última Actividad: {stats.lastActivity}
          </div>
        </div>
  
        {modalData && (
          <div className="popup">
            <div className="popup-content">
              <button className="popup-close" onClick={closeModal}>
                Cerrar
              </button>
              <h2 className="modal-title">{modalData.type}</h2>
              {modalData.error ? (
                <p>{modalData.error}</p>
              ) : modalData.type === "activeUsers" ? (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Nickname</th>
                      <th>Edad</th>
                      <th>Zodiaco</th>
                      <th>Ubicación</th>
                      <th>Cantidad de Entradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.data.map((user, index) => (
                      <tr key={index}>
                        <td>{user.nickname}</td>
                        <td>{user.age}</td>
                        <td>{user.zodiac}</td>
                        <td>{user.location}</td>
                        <td>{user.entryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : modalData.type === "entriesUploaded" ? (
                <>
                  <BarChart width={500} height={300} data={modalData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.chartData.map((category, index) => (
                        <tr key={index}>
                          <td>{category.name}</td>
                          <td>{category.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : modalData.type === "dailyUserActivity" ? (
                <LineChart width={500} height={300} data={modalData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                </LineChart>
              ) : modalData.type === "lastActivity" ? (
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Ubicación</th>
                      <th>Hora</th>
                      <th>Categoría Más Frecuente</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{modalData.user?.location || "No disponible"}</td>
                      <td>{modalData.timestamp}</td>
                      <td>
                        {modalData.mostFrequentCategory || "Sin categoría"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
              <p className="data-summary">
                {modalData.successCount} datos obtenidos,{" "}
                {modalData.errorCount || 0} no disponibles
              </p>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
  
};

export default Dashboard;
