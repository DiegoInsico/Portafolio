import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Asegúrate de que esta ruta sea correcta
import "chart.js/auto";

const Test = () => {
  const [chartData, setChartData] = useState(null);

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

      const labels = Object.keys(levelData);
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
          borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
          }, 1)`,
          backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
          }, 0.5)`,
        });
      });

      setChartData({
        labels,
        datasets,
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
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
  );
};

export default Test;
