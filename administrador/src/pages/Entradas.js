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
      try {
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
          totalEntriesCount++;

          // Categorías
          const category = entry.categoria || "Sin categoría";
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;

          // Emociones
          if (entry.emociones && Array.isArray(entry.emociones)) {
            totalEmotions += entry.emociones.length;
            entry.emociones.forEach((emotion) => {
              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
          }

          // Entradas por mes
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
        setAvgEmotionsPerEntry(
          totalEntriesCount > 0 ? totalEmotions / totalEntriesCount : 0
        );
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
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

  return (
    <Container>
      <div className="entradas-container">
        <h1 className="entradas-title">Estadísticas de Entradas</h1>

        {/* Tabla de estadísticas generales */}
        <div className="entradas-section">
          <h2 className="section-title">Estadísticas Generales</h2>
          <table className="entradas-table">
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

        {/* Tabla de entradas por categoría */}
        <div className="entradas-section">
          <h2 className="section-title">Entradas por Categoría</h2>
          <table className="entradas-table">
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

        {/* Gráfico de emociones */}
        <div className="entradas-section">
          <h2 className="section-title">Frecuencia de Emociones</h2>
          <div className="chart-container">
            <Bar data={emotionChartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Gráfico de entradas por mes */}
        <div className="entradas-section">
          <h2 className="section-title">Entradas por Mes</h2>
          <div className="chart-container">
            <Bar
              data={monthlyEntriesChartData}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Entradas;
