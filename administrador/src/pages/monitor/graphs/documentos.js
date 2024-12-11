import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según la estructura de tu proyecto
import "chart.js/auto";

const DocumentosChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const documentosCollection = collection(db, "documentos");
      const snapshot = await getDocs(documentosCollection);

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

      const labels = Object.keys(countGroups).map((key) => `${key} Documentos`);
      const data = Object.values(countGroups);

      setChartData({
        labels,
        datasets: [
          {
            label: "Usuarios",
            data,
            backgroundColor: labels.map(
              () => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
            ),
            borderColor: labels.map(
              () => `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`
            ),
            borderWidth: 1,
          },
        ],
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Usuarios por Número de Documentos</h2>
      {chartData ? (
        <Pie
          data={chartData}
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
    </div>
  );
};

export default DocumentosChart;
