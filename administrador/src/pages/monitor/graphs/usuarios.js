import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según tu estructura
import "chart.js/auto";

// Función para calcular la edad
const calculateAge = (birthDate) => {
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const UsuariosChart = () => {
  const [ageChartData, setAgeChartData] = useState(null);
  const [notificationChartData, setNotificationChartData] = useState(null);
  const [registrationTimeChartData, setRegistrationTimeChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);

      const ageCounts = {};
      const notificationsCounts = { Activas: 0, "No Activas": 0 };
      const registrationTimes = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Procesar edades
        const birthDate = data.birthDate ? new Date(data.birthDate.seconds * 1000) : null;
        if (birthDate) {
          const age = calculateAge(birthDate);
          if (!ageCounts[age]) ageCounts[age] = 0;
          ageCounts[age] += 1;
        }

        // Procesar notificaciones
        if (data.notificationsEnabled) {
          notificationsCounts["Activas"] += 1;
        } else {
          notificationsCounts["No Activas"] += 1;
        }

        // Tiempo de registro
        const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : null;
        if (createdAt) {
          const timeRegistered = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)); // días
          registrationTimes.push(timeRegistered);
        }
      });

      // Configuración de datos para los gráficos
      setAgeChartData({
        labels: Object.keys(ageCounts),
        datasets: [
          {
            label: "Distribución de Edades",
            data: Object.values(ageCounts),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      });

      setNotificationChartData({
        labels: ["Activas", "No Activas"],
        datasets: [
          {
            label: "Notificaciones Activas vs. No Activas",
            data: Object.values(notificationsCounts),
            backgroundColor: ["rgba(75, 192, 192, 0.5)", "rgba(255, 159, 64, 0.5)"],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 159, 64, 1)"],
            borderWidth: 1,
          },
        ],
      });

      setRegistrationTimeChartData({
        labels: registrationTimes.map((_, index) => `Usuario ${index + 1}`),
        datasets: [
          {
            label: "Días Registrados",
            data: registrationTimes,
            backgroundColor: "rgba(153, 102, 255, 0.5)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Distribución de Edades</h2>
      {ageChartData ? (
        <Bar
          data={ageChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Edades" } },
              y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}

      <h2>Notificaciones Activas vs. No Activas</h2>
      {notificationChartData ? (
        <Pie
          data={notificationChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}

      <h2>Tiempo de Registro de Usuarios (en días)</h2>
      {registrationTimeChartData ? (
        <Bar
          data={registrationTimeChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Usuarios" } },
              y: { title: { display: true, text: "Días Registrados" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default UsuariosChart;
