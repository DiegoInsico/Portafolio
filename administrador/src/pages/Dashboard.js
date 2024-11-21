import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Container from "../components/container";
import { collection, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { Line, Pie, Bar } from "react-chartjs-2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [chartData, setChartData] = useState({
    unverifiedUsers: null,
    categoryUsage: null,
    creationPeak: null,
  });
  const [selectedChart, setSelectedChart] = useState("creationPeak");

  useEffect(() => {
    const fetchStats = async () => {
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
          lastActivity: lastActivity.toDate().toLocaleString(),
          entriesUploaded,
          dailyUserActivity,
        });
      } catch (error) {
        console.error("Error obteniendo estadísticas de Firebase:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchMostPlayedSongs = async () => {
      try {
        const snapshot = await getDocs(collection(db, "entradas"));
        const songCounts = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.cancion) {
            const songId = `${data.cancion.artist}-${data.cancion.name}`;
            if (!songCounts[songId]) {
              songCounts[songId] = {
                artist: data.cancion.artist,
                name: data.cancion.name,
                albumImage: data.cancion.albumImage,
                count: 0,
              };
            }
            songCounts[songId].count += 1;
          }
        });

        const sortedSongs = Object.values(songCounts).sort((a, b) => b.count - a.count);
        setMostPlayedSongs(sortedSongs.slice(0, 2));
      } catch (error) {
        console.error("Error obteniendo canciones más escuchadas:", error);
      }
    };

    fetchMostPlayedSongs();
  }, []);

  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const ticketsQuery = query(
          collection(db, "tickets"),
          where("status", "==", "abierto")
        );
        const snapshot = await getDocs(ticketsQuery);

        const openTicketsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOpenTickets(openTicketsList);
      } catch (error) {
        console.error("Error obteniendo tickets abiertos:", error);
      }
    };

    fetchOpenTickets();
  }, []);

  const fetchChartData = async () => {
    try {
      const unverifiedUsersQuery = query(
        collection(db, "users"),
        where("isVerified", "==", false)
      );
      const unverifiedSnapshot = await getDocs(unverifiedUsersQuery);
      const unverifiedCount = unverifiedSnapshot.size;

      const categoryCount = {};
      const entriesSnapshot = await getDocs(collection(db, "entradas"));

      entriesSnapshot.forEach((doc) => {
        const data = doc.data();
        const categoria = data.categoria || "Sin categoría";
        categoryCount[categoria] = (categoryCount[categoria] || 0) + 1;
      });

      const dailyCreations = {};
      entriesSnapshot.forEach((doc) => {
        const fechaCreacion = doc.data().fechaCreacion.toDate();
        const dia = fechaCreacion.toLocaleDateString();
        dailyCreations[dia] = (dailyCreations[dia] || 0) + 1;
      });

      setChartData({
        unverifiedUsers: {
          labels: ["Usuarios sin verificar"],
          datasets: [
            {
              label: "Usuarios sin verificar",
              data: [unverifiedCount],
              backgroundColor: "rgba(255, 99, 132, 0.6)",
            },
          ],
        },
        categoryUsage: {
          labels: Object.keys(categoryCount),
          datasets: [
            {
              label: "Categorías Usadas",
              data: Object.values(categoryCount),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
          ],
        },
        creationPeak: {
          labels: Object.keys(dailyCreations),
          datasets: [
            {
              label: "Pico de Creaciones",
              data: Object.values(dailyCreations),
              backgroundColor: "rgba(75,192,192,0.4)",
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error obteniendo datos de gráficos:", error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

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
            <p>Cargando canciones...</p>
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
            openTickets.map((ticket) => <p key={ticket.id}>{ticket.subject}</p>)
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
