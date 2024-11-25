import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import UserHeatmap from "./monitor/graphs/userHeatmap";
import {
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "chart.js/auto";

ChartJS.register(ArcElement, Tooltip, Legend);


const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    lastActivity: "",
    entriesUploaded: 0,
    dailyUserActivity: 0,
  });
  const [mostPlayedSongs, setMostPlayedSongs] = useState([]);
  const [openTickets, setOpenTickets] = useState([]); // Estado para tickets abiertos
  const [selectedModal, setSelectedModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [unverifiedUsersData, setUnverifiedUsersData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [creationPeakData, setCreationPeakData] = useState(null);
  const [selectedChart, setSelectedChart] = useState("creationPeak");
  const [chartData, setChartData] = useState(null);

  const closeModal = () => {
    setSelectedModal(null);
    setModalData(null);
  };

  const showUnansweredTicketAlert = (ticket) => {
    toast.warn(
      `Ticket sin respuesta desde ${ticket.lastUpdate.toLocaleDateString()} (${ticket.diffInDays
      } días)`,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  };

  const calculateAgeAndZodiac = (birthDate) => {
    if (!birthDate) return { age: "Desconocida", zodiac: "Desconocido" };

    // Convertir birthDate si es un objeto DatetimeWithNanoseconds
    let birth;
    if (birthDate.toDate) {
      birth = birthDate.toDate(); // Firebase Timestamp a Date
    } else if (birthDate instanceof Date) {
      birth = birthDate; // Ya es un objeto Date
    } else {
      birth = new Date(birthDate); // Parsear como cadena de texto
    }

    // Verificar si la fecha es válida
    if (isNaN(birth)) return { age: "Desconocida", zodiac: "Desconocido" };

    // Calcular la edad
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }

    // Calcular el signo zodiacal
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
    const zodiacDates = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];

    const month = birth.getMonth();
    const day = birth.getDate();
    const zodiac =
      day > zodiacDates[month]
        ? zodiacSigns[(month + 1) % 12]
        : zodiacSigns[month];

    return { age, zodiac };
  };


  useEffect(() => {
    async function fetchData() {
      const entriesCollection = collection(db, "entradas");
      const snapshot = await getDocs(entriesCollection);

      const levelData = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Usa fecha o predeterminada
        const dateField = data.fecha
          ? new Date(data.fecha.seconds * 1000)
          : new Date();
        const date = dateField.toLocaleDateString();

        const level = data.nivel || "Sin Nivel";

        if (!levelData[date]) levelData[date] = {};
        if (!levelData[date][level]) levelData[date][level] = 0;

        levelData[date][level] += 1;
      });
      // Procesar datos para el gráfico
      const labels = Object.keys(levelData); // Fechas únicas
      const datasets = [];

      const levels = new Set();
      Object.values(levelData).forEach((dateLevels) => {
        Object.keys(dateLevels).forEach((level) => levels.add(level));
      });

      levels.forEach((level) => {
        const data = labels.map((date) => levelData[date][level] || 0);
        datasets.push({
          label: `Nivel ${level}`,
          data,
          borderColor: getRandomColor(),
          backgroundColor: getRandomColor(0.5),
        });
      });

      setChartData({
        labels,
        datasets,
      });
    }

    fetchData();
  }, []);


  // Función para generar colores aleatorios
  const getRandomColor = (opacity = 1) => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},${opacity})`;
  };

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
        const sortedSongs = Object.values(songCounts).sort(
          (a, b) => b.count - a.count
        );
        setMostPlayedSongs(sortedSongs.slice(0, 2));
      } catch (error) {
        console.error("Error fetching most played songs:", error);
      }
    };

    fetchMostPlayedSongs();
  }, []);

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
        labels: ["Categoría 1", "Categoría 2", "Categoría 3"],
        datasets: [
          {
            label: "Categorías Usadas",
            data: [10, 20, 30],
            backgroundColor: [
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
      console.log("Categoría Data:", {
        labels: Object.keys(categoryCount),
        datasets: [
          {
            data: Object.values(categoryCount),
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

  // recordatorio notificaciones
  useEffect(() => {
    const checkUnansweredTickets = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, "tickets"), where("status", "==", "abierto"))
        );

        const today = new Date();
        const lastNotified =
          JSON.parse(localStorage.getItem("lastNotifiedTickets")) || {};

        const pendingTickets = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const lastUpdate = data.updatedAt?.toDate();
            const diffInDays = Math.floor(
              (today - lastUpdate) / (1000 * 60 * 60 * 24)
            ); // Diferencia en días

            if (diffInDays >= 1 && !lastNotified[doc.id]) {
              showUnansweredTicketAlert({
                ...data,
                lastUpdate,
                diffInDays,
              });
              lastNotified[doc.id] = true;
            }

            return {
              ...data,
              id: doc.id,
              lastUpdate,
              diffInDays,
            };
          })
          .filter((ticket) => ticket);

        setOpenTickets(pendingTickets);
        localStorage.setItem(
          "lastNotifiedTickets",
          JSON.stringify(lastNotified)
        );
      } catch (error) {
        console.error("Error verificando tickets sin respuesta:", error);
      }
    };

    // Ejecuta la verificación una vez al día
    checkUnansweredTickets();
    const intervalId = setInterval(checkUnansweredTickets, 24 * 60 * 60 * 1000); // Cada 24 horas

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  // tickets con css
  useEffect(() => {
    const fetchOpenTickets = async () => {
      try {
        const ticketsQuery = query(
          collection(db, "tickets"),
          where("status", "==", "abierto")
        );
        const snapshot = await getDocs(ticketsQuery);

        const openTicketsList = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const ticketData = doc.data();
            const userId = ticketData.userId;

            let displayName = "Usuario desconocido";
            if (userId) {
              const userRef = collection(db, "users");
              const userSnapshot = await getDocs(
                query(userRef, where("uid", "==", userId))
              );
              if (!userSnapshot.empty) {
                displayName =
                  userSnapshot.docs[0].data().displayName ||
                  "Usuario desconocido";
              }
            }

            return { id: doc.id, ...ticketData, displayName };
          })
        );

        setOpenTickets(openTicketsList);
      } catch (error) {
        console.error("Error fetching open tickets:", error);
      }
    };

    fetchOpenTickets();
  }, []);

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
          const userStats = usersSnapshot.docs.map((userDoc) => {
            const user = userDoc.data();
            const { age, zodiac } = calculateAgeAndZodiac(user.birthDate); // Asegúrate de que birthDate es el campo correcto
            return {
              age,
              zodiac,
            };
          });

          setModalData({
            type,
            data: userStats,
          });
          break;
        }

        case "entriesUploaded": {
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const usersSnapshot = await getDocs(collection(db, "users"));

          // Crear un mapa para asociar `userId` con país y ciudad
          const userLocations = usersSnapshot.docs.reduce((acc, userDoc) => {
            const userData = userDoc.data();
            acc[userDoc.id] = {
              country: userData.country || "Desconocido",
              city: userData.city || "Desconocida",
            };
            return acc;
          }, {});

          // Agrupar entradas por categoría
          const categoryCounts = entriesSnapshot.docs.reduce(
            (acc, entryDoc) => {
              const category = entryDoc.data().categoria || "Desconocida";
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            },
            {}
          );

          // Agrupar entradas por ubicación (país y ciudad)
          const locationCounts = entriesSnapshot.docs.reduce(
            (acc, entryDoc) => {
              const userId = entryDoc.data().userId || "Desconocido";
              const location = userLocations[userId] || {
                country: "Desconocido",
                city: "Desconocida",
              };
              const locationKey = `${location.city}, ${location.country}`;
              acc[locationKey] = (acc[locationKey] || 0) + 1;
              return acc;
            },
            {}
          );

          // Formato para gráfico de categorías
          const chartData = Object.entries(categoryCounts).map(
            ([key, value]) => ({
              name: key,
              count: value,
            })
          );

          // Formato para tabla de ubicaciones
          const locationData = Object.entries(locationCounts).map(
            ([location, count]) => ({
              location,
              count,
            })
          );

          // Determinar si las entradas provienen de una o múltiples ubicaciones
          const totalLocations = Object.keys(locationCounts).length;
          const locationMessage =
            totalLocations === 1
              ? `Todas las entradas provienen de 1 ubicación.`
              : `Las entradas provienen de ${totalLocations} ubicaciones diferentes.`;

          setModalData({
            type,
            chartData,
            locationData,
            locationMessage,
            successCount: chartData.length,
          });
          break;
        }

        case "lastActivity": {
          const sessionsSnapshot = await getDocs(collection(db, "sessions"));
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const usersSnapshot = await getDocs(collection(db, "users"));

          const lastSession = sessionsSnapshot.docs.reduce(
            (latest, session) => {
              const rawTimestamp = session.data().timestamp;
              const sessionTimestamp =
                rawTimestamp instanceof Timestamp
                  ? rawTimestamp.toDate()
                  : new Date(rawTimestamp);

              return sessionTimestamp > (latest?.timestamp || 0)
                ? { ...session.data(), timestamp: sessionTimestamp }
                : latest;
            },
            null
          );

          if (lastSession) {
            const userId = lastSession.userId;
            const user = usersSnapshot.docs
              .find((doc) => doc.id === userId)
              ?.data();
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

            const mostFrequentCategory = Object.entries(lastEntry).reduce(
              (a, b) => (a[1] > b[1] ? a : b)
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
    <div className="main-dashboard">
      <div className="tickets-section">
        <h1>Tickets Pendientes</h1>
        {openTickets.length > 0 ? (
          openTickets.map((ticket) => (
            <p key={ticket.id}>{`${ticket.subject} - ${ticket.displayName}`}</p>
          ))
        ) : (
          <p>No hay tickets abiertos en este momento.</p>
        )}
      </div>

      <div className="info-section">
        <h1>Informacion</h1>
        <div className="card" onClick={() => handleModalOpen("activeUsers")}>
          <h3>Usuarios Activos</h3>
          <p>{stats.activeUsers}</p>
        </div>
        <div
          className="card"
          onClick={() => handleModalOpen("entriesUploaded")}
        >
          <h3>Entradas Subidas</h3>
          <p>{stats.entriesUploaded}</p>
        </div>
        <div
          className="card"
          onClick={() => handleModalOpen("dailyUserActivity")}
        >
          <h3>Actividad Diaria</h3>
          <p>{stats.dailyUserActivity}</p>
        </div>
        <div className="card" onClick={() => handleModalOpen("lastActivity")}>
          <h3>Última Actividad</h3>
          <p>{stats.lastActivity}</p>
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
                    <th>Edad</th>
                    <th>Signo Zodiacal</th>
                    <th>Cantidad de Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    modalData.data.reduce((acc, user) => {
                      const { age, zodiac } = user;
                      const key = `${age}-${zodiac}`;
                      if (!acc[key]) {
                        acc[key] = { age, zodiac, count: 0 };
                      }
                      acc[key].count++;
                      return acc;
                    }, {})
                  ).map(([key, { age, zodiac, count }], index) => (
                    <tr key={index}>
                      <td>{age}</td>
                      <td>{zodiac}</td>
                      <td>{count}</td>
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

                <p>{modalData.locationMessage}</p>

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

                <h3>Entradas por Ubicación</h3>
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Ubicación</th>
                      <th>Cantidad de Entradas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.locationData.map((location, index) => (
                      <tr key={index}>
                        <td>{location.location}</td>
                        <td>{location.count}</td>
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
                    <th>Ultima Categoría Usada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{modalData.user?.location || "No disponible"}</td>
                    <td>{modalData.timestamp}</td>
                    <td>{modalData.mostFrequentCategory || "Sin categoría"}</td>
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

      <div className="music-section">
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
                  <img
                    src={song.albumImage}
                    alt={song.name}
                    className="album-img"
                  />
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
        ) : mostPlayedSongs.length === 0 ? (
          <p>No hay usuarios escuchando música actualmente.</p>
        ) : (
          <p>Cargando artistas más escuchados...</p>
        )}
      </div>

      {/* visualizamos el mapa desde otra page */}
      <div className="map-section">
        <h1>Mapa de Usuarios</h1>
        <div style={{ height: "100%", width: "100%" }}>
          <UserHeatmap />
        </div>
      </div>

      {/* niveles de seguridad de los users */}
      <div className="charts-section">
        <h1>Niveles de Seguridad de los Usuarios</h1>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                tooltip: { enabled: true },
              },
              scales: {
                x: { title: { display: true, text: "Fechas" } },
                y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
              },
            }}
          />
        ) : (
          <p>Cargando datos...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
