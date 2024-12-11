import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según la estructura de tu proyecto
import "chart.js/auto";

const CertificadosChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const certificadosCollection = collection(db, "certificados");
      const snapshot = await getDocs(certificadosCollection);

      const userCounts = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId;

        if (!userCounts[userId]) {
          userCounts[userId] = 0;
        }

        userCounts[userId] += 1;
      });

      // Procesar datos agregados
      const countGroups = {};
      Object.values(userCounts).forEach((count) => {
        if (!countGroups[count]) {
          countGroups[count] = 0;
        }
        countGroups[count] += 1;
      });

      const labels = Object.keys(countGroups).map((key) => `${key} Certificados`);
      const data = Object.values(countGroups);

      setChartData({
        labels,
        datasets: [
          {
            label: "Número de Usuarios",
            data,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Usuarios por Número de Certificados</h2>
      {chartData ? (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Número de Certificados" } },
              y: { title: { display: true, text: "Cantidad de Usuarios" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default CertificadosChart;
