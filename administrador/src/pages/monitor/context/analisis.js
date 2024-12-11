import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según tu estructura
import "./css/analisis.css"; // Archivo de estilos CSS

const AnalisisChart = () => {
  const [chartData, setChartData] = useState(null);
  const [tableContext, setTableContext] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const entradasCollection = collection(db, "entradas");
      const snapshot = await getDocs(entradasCollection);

      const emotionsByDate = {};
      const categories = {};
      const privacyLevels = { 1: 0, 2: 0, 3: 0 };
      const overallEmotions = {};
      const users = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const userId = data.userId || "Desconocido";
        users.add(userId);

        // Emociones por fecha
        const date = data.fechaCreacion
          ? new Date(data.fechaCreacion.seconds * 1000)
              .toISOString()
              .split("T")[0]
          : "Sin Fecha";
        if (!emotionsByDate[date]) emotionsByDate[date] = {};
        (data.emociones || []).forEach((emotion) => {
          if (!emotionsByDate[date][emotion]) emotionsByDate[date][emotion] = 0;
          emotionsByDate[date][emotion] += 1;

          // Conteo total de emociones
          if (!overallEmotions[emotion]) overallEmotions[emotion] = 0;
          overallEmotions[emotion] += 1;
        });

        // Categorías
        const category = data.categoria || "Sin Categoría";
        if (!categories[category]) categories[category] = 0;
        categories[category] += 1;

        // Niveles de privacidad
        const level = data.nivel || 1;
        privacyLevels[level] += 1;
      });

      // Preparar datos para gráficos
      const dates = Object.keys(emotionsByDate).sort();
      const emotions = Object.keys(overallEmotions);

      const lineData = {
        labels: dates,
        datasets: emotions.map((emotion) => ({
          label: emotion,
          data: dates.map((date) => emotionsByDate[date]?.[emotion] || 0),
          borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
          }, 1)`,
          borderWidth: 2,
          fill: false,
        })),
      };

      const barData = {
        labels: Object.keys(categories),
        datasets: [
          {
            label: "Categorías",
            data: Object.values(categories),
            backgroundColor: Object.keys(categories).map(
              () =>
                `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                  Math.random() * 255
                }, 0.5)`
            ),
            borderColor: Object.keys(categories).map(
              () =>
                `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                  Math.random() * 255
                }, 1)`
            ),
            borderWidth: 1,
          },
        ],
      };

      const pieData = {
        labels: ["Nivel 1", "Nivel 2", "Nivel 3"],
        datasets: [
          {
            label: "Privacidad",
            data: Object.values(privacyLevels),
            backgroundColor: ["#4CAF50", "#FFC107", "#F44336"],
            borderColor: ["#388E3C", "#FFA000", "#D32F2F"],
            borderWidth: 1,
          },
        ],
      };

      // Preparar contexto para la tabla
      const context = {
        totalUsers: users.size,
        mostUsedCategories: Object.entries(categories)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 2)
          .map(([cat]) => cat),
        emotionSummary: emotions.map((emotion) => ({
          emotion,
          percentage: (
            (overallEmotions[emotion] /
              Object.values(overallEmotions).reduce((a, b) => a + b, 0)) *
            100
          ).toFixed(2),
        })),
        privacyDistribution: privacyLevels,
      };

      setChartData({ lineData, barData, pieData });
      setTableContext(context);
    }

    fetchData();
  }, []);

  return (
    <div className="analisis-container">
      <div className="table-section">
        <h2>Contexto General</h2>
        {tableContext && (
          <table className="context-table">
            <thead>
              <tr>
                <th>Usuarios Totales</th>
                <th>Categorías Más Usadas</th>
                <th>Resumen de Emociones</th>
                <th>Distribución de Privacidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{tableContext.totalUsers}</td>
                <td>{tableContext.mostUsedCategories.join(", ")}</td>
                <td>
                  {tableContext.emotionSummary
                    .map((e) => `${e.emotion}: ${e.percentage}%`)
                    .join(", ")}
                </td>
                <td>
                  Nivel 1: {tableContext.privacyDistribution[1]}
                  <br />
                  Nivel 2: {tableContext.privacyDistribution[2]}
                  <br />
                  Nivel 3: {tableContext.privacyDistribution[3]}
                </td>
              </tr>
            </tbody>

          </table>
        )}
      </div>
      <div className="chart-section">
        <h2>Emociones por Día</h2>
        {chartData && (
          <Bar data={chartData.lineData} options={{ responsive: true }} />
        )}
      </div>
      <div className="chart-section">
        <h2>Categorías</h2>
        {chartData && (
          <Bar data={chartData.barData} options={{ responsive: true }} />
        )}
      </div>
      <div className="chart-section">
        <h2>Niveles de Privacidad</h2>
        {chartData && (
          <Pie data={chartData.pieData} options={{ responsive: true }} />
        )}
      </div>
    </div>
  );
};

export default AnalisisChart;
