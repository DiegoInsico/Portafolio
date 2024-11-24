import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import Container from "../../components/container";
import { Bar, Pie } from 'react-chartjs-2';

const EmotionsPage = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [emotionCounts, setEmotionCounts] = useState({});
  const [musicUsers, setMusicUsers] = useState([]);
  const [noMusicUsersCount, setNoMusicUsersCount] = useState(0);
  const [userLevelsSummary, setUserLevelsSummary] = useState({});
  const [artistSongs, setArtistSongs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSet = new Set();
        const emotionsMap = {};
        const musicUsersSet = new Set();
        const noMusicUsersSet = new Set();
        const artistSongsArray = [];
        const levelsCount = {};

        const snapshot = await getDocs(collection(db, "entradas"));

        snapshot.forEach((doc) => {
          const data = doc.data();
          const { userId, emociones, cancion, nivel } = data;

          if (userId) usersSet.add(userId);

          if (emociones && emociones.length > 0) {
            emociones.forEach((emotion) => {
              if (!emotionsMap[emotion]) {
                emotionsMap[emotion] = 0;
              }
              emotionsMap[emotion] += 1;
            });
          }

          if (cancion) {
            musicUsersSet.add(userId);
            artistSongsArray.push({
              artist: cancion.artist,
              song: cancion.name,
              albumImage: cancion.albumImage,
            });
          } else {
            noMusicUsersSet.add(userId);
          }

          if (userId && nivel) {
            if (!levelsCount[nivel]) {
              levelsCount[nivel] = 0;
            }
            levelsCount[nivel] += 1;
          }
        });

        setTotalUsers(usersSet.size);
        setEmotionCounts(emotionsMap);
        setMusicUsers(Array.from(musicUsersSet));
        setNoMusicUsersCount(noMusicUsersSet.size);
        setArtistSongs(artistSongsArray);
        setUserLevelsSummary(levelsCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: "Emociones utilizadas",
        data: Object.values(emotionCounts),
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Han compartido música", "No han compartido música"],
    datasets: [
      {
        data: [musicUsers.length, noMusicUsersCount],
        backgroundColor: ["#4CAF50", "#F44336"],
        hoverBackgroundColor: ["#66BB6A", "#E57373"],
      },
    ],
  };

  return (
    <Container>
      <div className="emotions-container">
        <h1>Mundo de emociones</h1>
        <p>Total de usuarios en la plataforma: {totalUsers}</p>
        
        {/* Contenedor en cuadrícula 2x2 */}
        <div className="grid-container">
          {/* Gráfico de emociones */}
          <div className="grid-item">
            <h2>Gráfico de Emociones</h2>
            <div className="chart-container">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Gráfico circular para conteo de usuarios con y sin música */}
          <div className="grid-item">
            <h2>Usuarios con y sin Música</h2>
            <div className="chart-container">
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Gráfico de usuarios por nivel de entrada */}
          <div className="grid-item">
            <h2>Usuarios por Nivel de Entrada</h2>
            <div className="chart-container">
              <Bar
                data={{
                  labels: Object.keys(userLevelsSummary),
                  datasets: [
                    {
                      label: "Usuarios por Nivel de Entrada",
                      data: Object.values(userLevelsSummary),
                      backgroundColor: 'rgba(75,192,192,0.6)',
                      borderColor: 'rgba(75,192,192,1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabla de artistas y canciones */}
        <h2>Artistas y Canciones</h2>
        <div className="artist-songs-table-container">
          <table className="artist-songs-table">
            <thead>
              <tr>
                <th>Imagen del Álbum</th>
                <th>Artista</th>
                <th>Canción</th>
              </tr>
            </thead>
            <tbody>
              {artistSongs.map((entry, index) => (
                <tr key={index}>
                  <td>
                    <img src={entry.albumImage} alt={entry.song} width="50" height="50" />
                  </td>
                  <td>{entry.artist}</td>
                  <td>{entry.song}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default EmotionsPage;
