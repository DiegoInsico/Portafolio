import { db } from "../../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const getZodiacSign = (birthDate) => {
  const date = new Date(birthDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;

  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Acuario";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Piscis";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Tauro";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Géminis";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cáncer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitario";
  return "Capricornio";
};

export const fetchUsageData = async () => {
  const weeklyUsage = {};
  const hourlyRangeUsage = {
    "0-3": 0,
    "4-7": 0,
    "8-11": 0,
    "12-15": 0,
    "16-19": 0,
    "20-23": 0,
  };
  const countryData = {};
  const emotionCounts = {};
  const zodiacSigns = {};
  const securityLevels = { level2: 0, level3: 0 };
  const deceasedUsers = [];
  let premiumCount = 0;
  let nonPremiumCount = 0;

  const entradasSnapshot = await getDocs(
    query(collection(db, "entradas"), orderBy("fechaCreacion"))
  );

  entradasSnapshot.forEach((doc) => {
    const data = doc.data();
    const fechaCreacion = data.fechaCreacion.toDate();
    const hour = fechaCreacion.getHours();
    const emotions = data.emociones || [];

    // Rango de horas
    if (hour >= 0 && hour <= 3) hourlyRangeUsage["0-3"]++;
    else if (hour >= 4 && hour <= 7) hourlyRangeUsage["4-7"]++;
    else if (hour >= 8 && hour <= 11) hourlyRangeUsage["8-11"]++;
    else if (hour >= 12 && hour <= 15) hourlyRangeUsage["12-15"]++;
    else if (hour >= 16 && hour <= 19) hourlyRangeUsage["16-19"]++;
    else if (hour >= 20 && hour <= 23) hourlyRangeUsage["20-23"]++;

    // Emociones
    emotions.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

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
    if (data.isPremium) premiumCount++;
    else nonPremiumCount++;

    // País y ciudad
    const country = data.country || "Desconocido";
    countryData[country] = (countryData[country] || 0) + 1;

    // Signo zodiacal
    if (data.birthDate) {
      const zodiac = getZodiacSign(data.birthDate.seconds * 1000);
      zodiacSigns[zodiac] = (zodiacSigns[zodiac] || 0) + 1;
    }

    // Niveles de seguridad
    if (data.level2Password) securityLevels.level2++;
    if (data.level3Password) securityLevels.level3++;

    // Usuarios descansando
    if (data.isDeceased) deceasedUsers.push(data.displayName);
  });

  return {
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
    emotionData: {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          label: "Frecuencia de emociones",
          data: Object.values(emotionCounts),
          backgroundColor: [
            "rgba(255,99,132,0.2)",
            "rgba(54,162,235,0.2)",
            "rgba(75,192,192,0.2)",
            "rgba(153,102,255,0.2)",
          ],
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
          backgroundColor: [
            "#FF5733",
            "#33FF57",
            "#5733FF",
            "#FFD700",
            "#FF33A1",
          ],
        },
      ],
    },
    countryData: {
      labels: Object.keys(countryData),
      datasets: [
        {
          label: "Usuarios por País",
          data: Object.values(countryData),
          backgroundColor: ["#3f51b5", "#ff5722", "#8bc34a", "#ff9800"],
        },
      ],
    },
    securityLevels,
    deceasedUsers,
  };
};
