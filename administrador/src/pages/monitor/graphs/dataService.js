import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,

} from "firebase/firestore";
import { db } from "../../../firebase";
import { getMetadata, getStorage, listAll, ref } from "firebase/storage";

const CACHE_KEY = "usageDataCache";
const CACHE_EXPIRATION_KEY = "usageDataCacheExpiration";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const isCacheValid = () => {
  const expirationTime = localStorage.getItem(CACHE_EXPIRATION_KEY);
  return expirationTime && new Date().getTime() < Number(expirationTime);
};


// Función para calcular la edad
const calculateAge = (birthDate) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }
  

  return age;
};


// Función para obtener el signo zodiacal
const getZodiacSign = (birthDate) => {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return "Acuario";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Piscis";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Tauro";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20))
    return "Géminis";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cáncer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return "Escorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return "Sagitario";
  return "Capricornio";
};


// Función para obtener datos del dashboard
export const fetchDashboardData = async () => {
  try {
    // Estadísticas generales
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

    const statsData = {
      activeUsers,
      lastActivity: lastActivity.toDate().toLocaleString(),
      entriesUploaded,
      dailyUserActivity,
    };

    // Canciones más escuchadas
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

    const sortedSongs = Object.values(songCounts).sort(
      (a, b) => b.count - a.count
    );
    const mostPlayedSongsData = sortedSongs.slice(0, 2);

    // Tickets abiertos
    const ticketsQuery = query(
      collection(db, "tickets"),
      where("status", "==", "abierto")
    );
    const ticketsSnapshot = await getDocs(ticketsQuery);

    const openTicketsData = ticketsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Datos de gráficos
    const unverifiedUsersQuery = query(
      collection(db, "users"),
      where("isVerified", "==", false)
    );
    const unverifiedSnapshot = await getDocs(unverifiedUsersQuery);
    const unverifiedCount = unverifiedSnapshot.size;

    const categoryCount = {};
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

    const chartData = {
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
    };

    return {
      statsData,
      mostPlayedSongsData,
      openTicketsData,
      chartData,
    };
  } catch (error) {
    console.error("Error obteniendo datos del dashboard:", error);
    throw error;
  }
};

export const fetchActiveUsersData = async () => {
  // Fetch data for active users
  const usersSnapshot = await getDocs(collection(db, "users"));
  const users = usersSnapshot.docs.map((doc) => ({
    username: doc.data().username,
    country: doc.data().country || "Desconocido",
    city: doc.data().city || "Desconocida",
  }));
  return users;
};

export const fetchEntriesData = async () => {
  // Fetch data for entries
  const entriesSnapshot = await getDocs(collection(db, "entradas"));
  const entries = entriesSnapshot.docs.map((doc) => ({
    type: doc.data().tipo || "Desconocido",
    securityLevel: doc.data().nivelSeguridad || "Baja",
  }));
  return entries;
};

export const fetchLastActivityData = async () => {
  // Fetch data for last activity
  const activitiesSnapshot = await getDocs(
    query(collection(db, "activities"), orderBy("timestamp", "desc"), limit(10))
  );
  const activities = activitiesSnapshot.docs.map((doc) => ({
    date: doc.data().timestamp?.toDate().toLocaleString() || "Desconocida",
    description: doc.data().descripcion || "Sin descripción",
  }));
  return { history: activities };
};

export const fetchDailyActivityData = async () => {
  // Fetch data for daily user activity
  const dailySnapshot = await getDocs(collection(db, "dailyActivity"));
  const lastEntry = dailySnapshot.docs[0]?.data() || {};
  return {
    type: lastEntry.tipo || "Desconocido",
    user: lastEntry.username || "Anónimo",
  };
};

// Función para obtener datos de almacenamiento
export const fetchStorageData = async () => {
  const storage = getStorage();
  const storageRef = ref(storage, "/");
  const storageData = {
    Imagen: { count: 0, size: 0 },
    Video: { count: 0, size: 0 },
    Audio: { count: 0, size: 0 },
    Texto: { count: 0, size: 0 },
  };

  try {
    const folderList = await listAll(storageRef);

    for (const folder of folderList.prefixes) {
      const folderRef = ref(storage, folder.fullPath);
      const fileList = await listAll(folderRef);

      for (const file of fileList.items) {
        const metadata = await getMetadata(file);
        const contentType = metadata.contentType;
        const size = metadata.size; // Tamaño en bytes

        if (contentType.startsWith("image/")) {
          storageData.Imagen.count += 1;
          storageData.Imagen.size += size;
        } else if (contentType.startsWith("video/")) {
          storageData.Video.count += 1;
          storageData.Video.size += size;
        } else if (
          contentType.startsWith("audio/") ||
          contentType === "application/ogg"
        ) {
          storageData.Audio.count += 1;
          storageData.Audio.size += size;
        } else if (contentType.startsWith("text/")) {
          storageData.Texto.count += 1;
          storageData.Texto.size += size;
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener datos de almacenamiento:", error);
  }

  // Convertir tamaños a MB
  for (const key in storageData) {
    storageData[key].size = (storageData[key].size / (1024 * 1024)).toFixed(2); // Convertir a MB
  }

  return storageData;
};

// Función principal para obtener datos de uso
export const fetchUsageData = async () => {
  if (isCacheValid()) {
    console.log("Usando datos del caché");
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  }

  console.log("Cargando datos desde la base de datos");

  const weeklyUsage = {};
  const hourlyRangeUsage = {
    "0-3": 0,
    "4-7": 0,
    "8-11": 0,
    "12-15": 0,
    "16-19": 0,
    "20-23": 0,
  };
  const categoryUsage = {};
  const dailyCreations = {};
  const emotionCounts = {};
  const countryData = {};
  const cityData = {};
  const zodiacSigns = {};
  let premiumCount = 0;
  let nonPremiumCount = 0;
  let verifiedTrue = 0;
  let verifiedFalse = 0;
  let notificationsTrue = 0;
  let notificationsFalse = 0;
  const ageGroups = {};

  const entradasSnapshot = await getDocs(
    query(collection(db, "entradas"), orderBy("fechaCreacion"))
  );

  entradasSnapshot.forEach((doc) => {
    const data = doc.data();
    const fechaCreacion = data.fechaCreacion.toDate();
    const day = fechaCreacion.toLocaleDateString();
    const hour = fechaCreacion.getHours();
    const category = data.categoria || "Sin categoría";
    const emotions = data.emociones || [];

    // Rango de horas
    if (hour >= 0 && hour <= 3) hourlyRangeUsage["0-3"]++;
    else if (hour >= 4 && hour <= 7) hourlyRangeUsage["4-7"]++;
    else if (hour >= 8 && hour <= 11) hourlyRangeUsage["8-11"]++;
    else if (hour >= 12 && hour <= 15) hourlyRangeUsage["12-15"]++;
    else if (hour >= 16 && hour <= 19) hourlyRangeUsage["16-19"]++;
    else if (hour >= 20 && hour <= 23) hourlyRangeUsage["20-23"]++;

    // Categorías
    categoryUsage[category] = (categoryUsage[category] || 0) + 1;

    // Emociones
    emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    // Creaciones diarias
    dailyCreations[day] = (dailyCreations[day] || 0) + 1;

    // Semana
    const startOfWeek = new Date(fechaCreacion);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekLabel = `${startOfWeek.toLocaleDateString()} / ${new Date(
      startOfWeek.setDate(startOfWeek.getDate() + 6)
    ).toLocaleDateString()}`;
    weeklyUsage[weekLabel] = (weeklyUsage[weekLabel] || 0) + 1;
  });

  const usersSnapshot = await getDocs(query(collection(db, "users")));

  usersSnapshot.forEach((doc) => {
    const data = doc.data();

    if (data.birthDate) {
      // 1. Calcular la edad
      const birthDateMs = data.birthDate.seconds * 1000;
      const age = calculateAge(birthDateMs);
      const ageGroup = `${Math.floor(age / 10) * 10}s`;
      ageGroups[age] = (ageGroups[age] || 0) + 1;
  
      // 2. Obtener el signo zodiacal con base en la fecha de nacimiento
      const zodiac = getZodiacSign(birthDateMs);
      zodiacSigns[zodiac] = (zodiacSigns[zodiac] || 0) + 1;
    } else {
      // Si no hay fecha de nacimiento, agrupar como "Desconocido"
      ageGroups["Undefined"] = (ageGroups["Undefined"] || 0) + 1;
    }

    
    if (data.isPremium) premiumCount++;
    else nonPremiumCount++;

    // País y ciudad
    const country = data.country || "Pais Desconocido";
    countryData[country] = (countryData[country] || 0) + 1;
    const city = data.city || "Ciudad Desconocida";
    cityData[city] = (cityData[city] || 0) + 1;

    // Signo zodiacal
    if (data.birthDate) {
      const zodiac = getZodiacSign(data.birthDate.seconds * 1000);
      zodiacSigns[zodiac] = (zodiacSigns[zodiac] || 0) + 1;
    }

    // Verificados
    if (data.isVerified) verifiedTrue++;
    else verifiedFalse++;

    // Notificaciones activadas
    if (data.notificationsEnabled) notificationsTrue++;
    else notificationsFalse++;

    if (data.birthDate) {
      const birthDateMs = data.birthDate.seconds * 1000;
      const age = calculateAge(birthDateMs);
      const ageGroup = `${Math.floor(age / 10) * 10}s`;
      ageGroups[age] = (ageGroups[age] || 0) + 1;

      const zodiac = getZodiacSign(birthDateMs);
      zodiacSigns[zodiac] = (zodiacSigns[zodiac] || 0) + 1;
    }
  });
  const data = {
    zodiacSigns,
    ageGroups,

    weeklyData: {
      labels: Object.keys(weeklyUsage),
      datasets: [
        {
          label: "Uso semanal de usuarios",
          data: Object.values(weeklyUsage),
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
        },
      ],
    },
    hourlyRangeData: {
      labels: Object.keys(hourlyRangeUsage),
      datasets: [
        {
          label: "Uso por rango de horas",
          data: Object.values(hourlyRangeUsage),
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
        },
      ],
    },
    categoryUsageData: {
      labels: Object.keys(categoryUsage),
      datasets: [
        {
          label: "Categorías más utilizadas",
          data: Object.values(categoryUsage),
          backgroundColor: "#ffa726",
        },
      ],
    },
    dailyCreationsData: {
      labels: Object.keys(dailyCreations),
      datasets: [
        {
          label: "Creaciones Diarias",
          data: Object.values(dailyCreations),
          borderColor: "rgba(75, 192, 192, 1)",
          fill: false,
        },
      ],
    },
    emotionData: {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          label: "Frecuencia de emociones",
          data: Object.values(emotionCounts),
          backgroundColor: "#66bb6a",
        },
      ],
    },
    premiumUserData: {
      labels: ["Usuarios Premium", "Usuarios No Premium"],
      datasets: [
        {
          label: "Distribución de Usuarios Premium",
          data: [premiumCount, nonPremiumCount],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    zodiacSignData: {
      labels: Object.keys(zodiacSigns),
      datasets: [
        {
          label: "Distribución de Signos Zodiacales",
          data: Object.values(zodiacSigns),
          backgroundColor: "#42a5f5",
        },
      ],
    },
    countryData: {
      labels: Object.keys(countryData),
      datasets: [
        {
          label: "Usuarios por País",
          data: Object.values(countryData),
          backgroundColor: "#ef5350",
        },
      ],
    },
    cityData: {
      labels: Object.keys(cityData),
      datasets: [
        {
          label: "Usuarios por Ciudad",
          data: Object.values(cityData),
          backgroundColor: "#ef5350",
        },
      ],
    },
    verifiedUserData: {
      labels: ["Verificados", "No Verificados"],
      datasets: [
        {
          label: "Estado de Verificación",
          data: [verifiedTrue, verifiedFalse],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    },
    notificationsUserData: {
      labels: ["Notificaciones Activas", "Notificaciones Inactivas"],
      datasets: [
        {
          label: "Estado de Notificaciones",
          data: [notificationsTrue, notificationsFalse],
          backgroundColor: ["#42a5f5", "#ef5350"],
        },
      ],
    },
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(
    CACHE_EXPIRATION_KEY,
    new Date().getTime() + CACHE_DURATION
  );

  return data;
};
