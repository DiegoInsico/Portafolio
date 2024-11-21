// src/pages/Entradas.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import Container from "../components/container";
import "./Entradas.css";

const Entradas = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [entriesByCategory, setEntriesByCategory] = useState({});
  const [emotionCount, setEmotionCount] = useState({});
  const [entriesByMonth, setEntriesByMonth] = useState({});
  const [avgEmotionsPerEntry, setAvgEmotionsPerEntry] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const entriesList = entriesSnapshot.docs.map((doc) => doc.data());

      const userSet = new Set();
      let totalEntriesCount = 0;
      const categoryCounts = {};
      const emotionCounts = {};
      const monthlyEntries = {};
      let totalEmotions = 0;

      entriesList.forEach((entry) => {
        userSet.add(entry.userId);
        totalEntriesCount += 1;

        // Contar categorías
        const category = entry.categoria || "Sin categoría";
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Contar emociones
        if (entry.emociones && Array.isArray(entry.emociones)) {
          totalEmotions += entry.emociones.length;
          entry.emociones.forEach((emotion) => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });
        }

        // Contar entradas por mes
        const creationDate = entry.fechaCreacion
          ? new Date(entry.fechaCreacion.seconds * 1000)
          : new Date();
        const month = creationDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        monthlyEntries[month] = (monthlyEntries[month] || 0) + 1;
      });

      setTotalUsers(userSet.size);
      setTotalEntries(totalEntriesCount);
      setEntriesByCategory(categoryCounts);
      setEmotionCount(emotionCounts);
      setEntriesByMonth(monthlyEntries);
      setAvgEmotionsPerEntry(totalEmotions / totalEntriesCount);
    };

    fetchData();
  }, []);

  const emotionChartData = {
    labels: Object.keys(emotionCount),
    datasets: [
      {
        label: "Frecuencia de Emociones",
        data: Object.values(emotionCount),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  const emotionChartOptions = {
    maintainAspectRatio: false,
  };

  // Configuración para el gráfico de entradas por mes
  const monthlyEntriesChartData = {
    labels: Object.keys(entriesByMonth),
    datasets: [
      {
        label: "Entradas por Mes",
        data: Object.values(entriesByMonth),
        backgroundColor: "rgba(255,159,64,0.6)",
      },
    ],
  };

  const monthlyEntriesChartOptions = {
    maintainAspectRatio: false,
  };

  return (
      <div className="entradas-container">
        <div className="entradas-content">
          {/* Contenedor para la tabla de estadísticas generales */}
          <div className="table-container">
            <h2>Estadísticas Generales</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Métrica</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total de Usuarios</td>
                  <td>{totalUsers}</td>
                </tr>
                <tr>
                  <td>Total de Entradas</td>
                  <td>{totalEntries}</td>
                </tr>
                <tr>
                  <td>Promedio de Emociones por Entrada</td>
                  <td>{avgEmotionsPerEntry.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Contenedor para la tabla de entradas por categoría */}
          <div className="category-table-container">
            <h2>Entradas por Categoría</h2>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(entriesByCategory).map(([category, count]) => (
                  <tr key={category}>
                    <td>{category}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="emotion-chart-container">
            <h2>Frecuencia de Emociones en las Entradas</h2>
            <Bar data={emotionChartData} options={emotionChartOptions} />
          </div>

          <div className="monthly-entries-chart-container">
            <h2>Tendencia de Entradas por Mes</h2>
            <Bar
              data={monthlyEntriesChartData}
              options={monthlyEntriesChartOptions}
            />
          </div>
        </div>
      </div>
  );
};

export default Entradas;
