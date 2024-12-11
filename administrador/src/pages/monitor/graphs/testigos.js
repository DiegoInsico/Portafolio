import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const TestigosChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchTestigos() {
      const testigosCollection = collection(db, "testigos");
      const snapshot = await getDocs(testigosCollection);

      const testigosCount = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId || "userUndefined";

        if (!testigosCount[userId]) {
          testigosCount[userId] = 0;
        }

        testigosCount[userId] += 1;
      });

      // Preparar datos para el gráfico
      const labels = Object.keys(testigosCount).map((id) =>
        id === "userUndefined" ? "userUndefined" : `user${Object.keys(testigosCount).indexOf(id) + 1}`
      );

      const data = Object.values(testigosCount);

      setChartData({
        labels,
        datasets: [
          {
            label: "Cantidad de Testigos",
            data,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      });
    }

    fetchTestigos();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Testigos por Usuario</h2>
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
              x: { title: { display: true, text: "Usuarios" } },
              y: { title: { display: true, text: "Cantidad de Testigos" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default TestigosChart;
