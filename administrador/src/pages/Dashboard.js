import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Container from "../components/container";
import { fetchDashboardData, fetchActiveUsersData, fetchEntriesData, fetchLastActivityData, fetchDailyActivityData } from "./monitor/graphs/dataService";
import { Line, Pie, Bar } from "react-chartjs-2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import Modal from "../components/modal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });
  const [mostPlayedSongs, setMostPlayedSongs] = useState([]);
  const [openTickets, setOpenTickets] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedChart, setSelectedChart] = useState("ageDistribution");
  const [loading, setLoading] = useState(true);
  const [selectedModal, setSelectedModal] = useState(null); // Tracks modal type
  const [modalData, setModalData] = useState(null); // Data for each modal

  const closeModal = () => {
    setSelectedModal(null);
    setModalData(null);
  };

  const handleModalOpen = async (type) => {
    try {
      switch (type) {
        case "activeUsers":
          const users = await fetchActiveUsersData();
          setModalData(users);
          break;
        case "entriesUploaded":
          const entries = await fetchEntriesData();
          setModalData(entries);
          break;
        case "lastActivity":
          const activity = await fetchLastActivityData();
          setModalData(activity);
          break;
        case "dailyUserActivity":
          const dailyActivity = await fetchDailyActivityData();
          setModalData(dailyActivity);
          break;
        default:
          setModalData(null);
      }
      setSelectedModal(type);
    } catch (error) {
      console.error("Error fetching modal data:", error);
      toast.error("Error al cargar datos adicionales.");
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const {
          statsData,
          mostPlayedSongsData,
          openTicketsData,
          chartData,
        } = await fetchDashboardData();

        setStats(statsData);
        setMostPlayedSongs(mostPlayedSongsData);
        setOpenTickets(openTicketsData);
        setChartData(chartData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Error al cargar datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <Container>
        <div className="dashboard-loading">Cargando datos del dashboard...</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="dashboard-grid">
        <div className="dashboard-stats">
          <h1>Estadísticas Generales</h1>
          <div className="dashboard-cards">
            <div className="card" onClick={() => handleModalOpen("activeUsers")}>
              Usuarios Activos: {stats.activeUsers}
            </div>
            <div className="card" onClick={() => handleModalOpen("lastActivity")}>
              Última Actividad: {stats.lastActivity}
            </div>
            <div className="card" onClick={() => handleModalOpen("entriesUploaded")}>
              Entradas Subidas: {stats.entriesUploaded}
            </div>
            <div className="card" onClick={() => handleModalOpen("dailyUserActivity")}>
              Actividad Diaria: {stats.dailyUserActivity}
            </div>
          </div>
        </div>
        <div className="dashboard-music">
          <h2>Artistas Más Escuchados</h2>
          {mostPlayedSongs.length ? (
            mostPlayedSongs.map((song, index) => (
              <div key={index} className="song-card">
                <p>{`${song.name} - ${song.artist}`}</p>
                {song.albumImage && <img src={song.albumImage} alt={song.name} />}
              </div>
            ))
          ) : (
            <p>No hay canciones disponibles.</p>
          )}
        </div>
        <div className="dashboard-charts">
          <h2>Gráficos</h2>
          <div className="chart-buttons">
            <button onClick={() => setSelectedChart("ageDistribution")}>
              Distribución de Edades
            </button>
            <button onClick={() => setSelectedChart("categoryUsage")}>
              Categorías Usadas
            </button>
            <button onClick={() => setSelectedChart("creationPeak")}>
              Picos de Creación
            </button>
          </div>
          <div className="chart-content">
            {selectedChart === "ageDistribution" && chartData.ageDistributionData && (
              <Bar data={chartData.ageDistributionData} />
            )}
            {selectedChart === "categoryUsage" && chartData.categoryUsage && (
              <Pie data={chartData.categoryUsage} />
            )}
            {selectedChart === "creationPeak" && chartData.creationPeak && (
              <Line data={chartData.creationPeak} />
            )}
          </div>
        </div>
        <div className="dashboard-tickets">
          <h2>Tickets Abiertos</h2>
          {openTickets.length ? (
            openTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <p>{ticket.subject}</p>
              </div>
            ))
          ) : (
            <p>No hay tickets abiertos.</p>
          )}
        </div>
        <ToastContainer />
      </div>

      {selectedModal && (
        <Modal title={selectedModal} onClose={closeModal}>
          {selectedModal === "activeUsers" &&
            modalData?.map((user, index) => (
              <p key={index}>
                {user.username} - País: {user.country}, Ciudad: {user.city}
              </p>
            ))}
          {selectedModal === "entriesUploaded" &&
            modalData?.map((entry, index) => (
              <p key={index}>
                Tipo: {entry.type}, Nivel de Seguridad: {entry.securityLevel}
              </p>
            ))}
          {selectedModal === "lastActivity" && (
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {modalData?.history?.map((activity, index) => (
                  <tr key={index}>
                    <td>{activity.date}</td>
                    <td>{activity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {selectedModal === "dailyUserActivity" && (
            <p>
              Última Entrada Subida: {modalData?.type} por {modalData?.user}
            </p>
          )}
        </Modal>
      )}
    </Container>
  );
};

export default Dashboard;
