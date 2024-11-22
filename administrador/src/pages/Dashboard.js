import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Container from "../components/container";
import { fetchDashboardData } from "./monitor/graphs/dataService";
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
  const [selectedChart, setSelectedChart] = useState("creationPeak");
  const [loading, setLoading] = useState(true);

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
        console.error("Error cargando datos del dashboard:", error);
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
      <div className="dashboard-container">
        <div className="dashboard-stats">
          <h1>Estadísticas Generales</h1>
          <div className="dashboard-cards">
            <div className="card">Usuarios Activos: {stats.activeUsers}</div>
            <div className="card">Última Actividad: {stats.lastActivity}</div>
            <div className="card">Entradas Subidas: {stats.entriesUploaded}</div>
            <div className="card">Actividad Diaria: {stats.dailyUserActivity}</div>
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
          <button onClick={() => setSelectedChart("unverifiedUsers")}>
            Usuarios sin verificar
          </button>
          <button onClick={() => setSelectedChart("categoryUsage")}>
            Categorías usadas
          </button>
          <button onClick={() => setSelectedChart("creationPeak")}>
            Picos de Creación
          </button>
          {selectedChart === "unverifiedUsers" && chartData.unverifiedUsers && (
            <Bar data={chartData.unverifiedUsers} />
          )}
          {selectedChart === "categoryUsage" && chartData.categoryUsage && (
            <Pie data={chartData.categoryUsage} />
          )}
          {selectedChart === "creationPeak" && chartData.creationPeak && (
            <Line data={chartData.creationPeak} />
          )}
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
    </Container>
  );
};

export default Dashboard;
