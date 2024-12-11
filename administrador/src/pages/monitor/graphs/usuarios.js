import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import "chart.js/auto";

// Función para calcular la edad
const calculateAge = (birthDate) => {
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

const UsuariosChart = () => {
  const [ageChartData, setAgeChartData] = useState(null);
  const [locationChartData, setLocationChartData] = useState(null);
  const [deceasedChartData, setDeceasedChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);

      const ageCounts = {};
      const locationCounts = { Pais: {}, Ciudad: {}, Comuna: {} };
      const deceasedCounts = { Difuntos: 0, "No Difuntos": 0 };

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Procesar edades
        const birthDate = data.birthDate ? new Date(data.birthDate.seconds * 1000) : null;
        if (birthDate) {
          const age = calculateAge(birthDate);
          if (!ageCounts[age]) ageCounts[age] = 0;
          ageCounts[age] += 1;
        }

        // Procesar ubicación
        const pais = data.pais || "Indefinido";
        const ciudad = data.ciudad || "Indefinida";
        const comuna = data.comuna || "Indefinida";

        if (!locationCounts.Pais[pais]) locationCounts.Pais[pais] = 0;
        locationCounts.Pais[pais] += 1;

        if (!locationCounts.Ciudad[ciudad]) locationCounts.Ciudad[ciudad] = 0;
        locationCounts.Ciudad[ciudad] += 1;

        if (!locationCounts.Comuna[comuna]) locationCounts.Comuna[comuna] = 0;
        locationCounts.Comuna[comuna] += 1;

        // Procesar difuntos
        if (data.isDeceased) {
          deceasedCounts.Difuntos += 1;
        } else {
          deceasedCounts["No Difuntos"] += 1;
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

      setLocationChartData({
        pais: {
          labels: Object.keys(locationCounts.Pais),
          datasets: [
            {
              label: "Distribución por País",
              data: Object.values(locationCounts.Pais),
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        ciudad: {
          labels: Object.keys(locationCounts.Ciudad),
          datasets: [
            {
              label: "Distribución por Ciudad",
              data: Object.values(locationCounts.Ciudad),
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        },
        comuna: {
          labels: Object.keys(locationCounts.Comuna),
          datasets: [
            {
              label: "Distribución por Comuna",
              data: Object.values(locationCounts.Comuna),
              backgroundColor: "rgba(255, 159, 64, 0.5)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
          ],
        },
      });

      setDeceasedChartData({
        labels: ["Difuntos", "No Difuntos"],
        datasets: [
          {
            label: "Estado de Difuntos",
            data: Object.values(deceasedCounts),
            backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
            borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
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

      <h2>Distribución por País</h2>
      {locationChartData && locationChartData.pais ? (
        <Bar
          data={locationChartData.pais}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "País" } },
              y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}

      <h2>Estado de Difuntos</h2>
      {deceasedChartData ? (
        <Pie
          data={deceasedChartData}
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

      {/* Gráficos adicionales: Ciudad y Comuna */}
      <h2>Distribución por Ciudad</h2>
      {locationChartData && locationChartData.ciudad ? (
        <Bar
          data={locationChartData.ciudad}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Ciudad" } },
              y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}

      <h2>Distribución por Comuna</h2>
      {locationChartData && locationChartData.comuna ? (
        <Bar
          data={locationChartData.comuna}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Comuna" } },
              y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
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
