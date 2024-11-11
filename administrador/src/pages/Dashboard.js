import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Archivo de estilos actualizado
import Container from "../components/container";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { Line, Pie, Bar } from "react-chartjs-2";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });
  const [mostPlayedSongs, setMostPlayedSongs] = useState([]);

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

        // Get top 2 most played songs
        const sortedSongs = Object.values(songCounts).sort((a, b) => b.count - a.count);
        setMostPlayedSongs(sortedSongs.slice(0, 2));
      } catch (error) {
        console.error("Error fetching most played songs:", error);
      }
    };

    fetchMostPlayedSongs();
  }, []);
  const [unverifiedUsersData, setUnverifiedUsersData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [creationPeakData, setCreationPeakData] = useState(null);
  const [selectedChart, setSelectedChart] = useState("creationPeak");



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

  const fetchChartData = async () => {
    try {
      // 1. Usuarios sin verificar
      const unverifiedUsersQuery = query(
        collection(db, "users"),
        where("isVerified", "==", false)
      );
      const unverifiedSnapshot = await getDocs(unverifiedUsersQuery);
      const unverifiedCount = unverifiedSnapshot.size;

      setUnverifiedUsersData({
        labels: ["Usuarios sin verificar"],
        datasets: [
          {
            label: "Usuarios sin verificar",
            data: [unverifiedCount],
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      });

      // 2. Categoría más usada
      const categoryCount = {};
      const entriesSnapshot = await getDocs(collection(db, "entradas"));

      entriesSnapshot.forEach((doc) => {
        const data = doc.data();
        const categoria = data.categoria || "Sin categoría";
        if (categoryCount[categoria]) {
          categoryCount[categoria]++;
        } else {
          categoryCount[categoria] = 1;
        }
      });

      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            label: "Categorías Usadas",
            data: Object.values(categoryCount),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            hoverBackgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      });

      // 3. Pico de creaciones (por día)
      const dailyCreations = {};
      entriesSnapshot.forEach((doc) => {
        const fechaCreacion = doc.data().fechaCreacion.toDate();
        const dia = fechaCreacion.toLocaleDateString();
        if (dailyCreations[dia]) {
          dailyCreations[dia]++;
        } else {
          dailyCreations[dia] = 1;
        }
      });

      setCreationPeakData({
        labels: Object.keys(dailyCreations),
        datasets: [
          {
            label: "Pico de Creaciones por Día",
            data: Object.values(dailyCreations),
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error obteniendo datos de los gráficos:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchChartData();
  }, []);

  const handleButtonClick = (chartType) => {
    setSelectedChart(chartType);
  };

  return (
    <Container>
      <div className="dashboard-container">
        <div className="dashboard-content">
          <h1 className="dash-tittle">Dashboard</h1>
          <div className="notifi-area">
            <h1>notificaciones por responder</h1>
            <p>soy un usuario molesto primero</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto2</p>
            <p>soy un usuario molesto ultimo</p>
          </div>

          <div className="dash-music">
            <h1>Artistas más escuchados:</h1>
            {mostPlayedSongs.length > 0 ? (
              mostPlayedSongs.map((song, index) => (
                <div className="loader" key={index}>
                  <div className="song">
                    <p className="name">{song.name}</p>
                    <p className="artist">{song.artist}</p>
                  </div>
                  <div className="albumcover">
                    {song.albumImage && (
                      <img src={song.albumImage} alt={song.name} className="album-img" />
                    )}
                  </div>
                  <div className="loading">
                    <div className="load"></div>
                    <div className="load"></div>
                    <div className="load"></div>
                    <div className="load"></div>
                  </div>
                </div>
              ))
            ) : (
              <p>Cargando artistas más escuchados...</p>
            )}
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
          <div className="dash-chart-container">
            <h1>Información Adicional</h1>
            {selectedChart === "unverifiedUsers" && unverifiedUsersData && (
              <div className="chart-content chart-unverified-users">
                <h2>Usuarios sin Verificar</h2>
                <Bar data={unverifiedUsersData} />
              </div>
            )}
            {selectedChart === "categoryUsage" && categoryData && (
              <div className="chart-content chart-category-usage">
                <h2>Categoría Más Usada</h2>
                <Pie data={categoryData} />
              </div>
            )}
            {selectedChart === "creationPeak" && creationPeakData && (
              <div className="chart-content chart-creation-peak">
                <h2>Pico de Creaciones</h2>
                <Line data={creationPeakData} />
              </div>
            )}
          </div>
          <div className="btn-functions">
            <h1>Seleccione un gráfico para ver a la izquierda</h1>
            <button className="btn-perso" onClick={() => handleButtonClick("unverifiedUsers")}>Usuarios sin verificar</button>
            <button className="btn-perso" onClick={() => handleButtonClick("categoryUsage")}>Categoría más usada</button>
            <button className="btn-perso" onClick={() => handleButtonClick("creationPeak")}>Pico de creaciones</button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
