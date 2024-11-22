import React, { useState, useEffect } from "react";
import { fetchUsageData } from "./graphs/dataService";
import ExportButtons from "./graphs/exportButtons";
import { Bar, Pie } from "react-chartjs-2";
import "./graphs.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement);

const Graphics = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState("weeklyUsage");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchUsageData();
        setChartData(data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="graph-loading">Cargando datos...</p>;

  const renderChart = () => {
    switch (selectedChart) {
      case "weeklyUsage":
        return (
          <Bar data={chartData.weeklyData} options={{ maintainAspectRatio: true }} />
        );
      case "hourlyRange":
        return (
          <Bar data={chartData.hourlyRangeData} options={{ maintainAspectRatio: true }} />
        );
      case "emotionData":
        return (
          <Bar data={chartData.emotionData} options={{ maintainAspectRatio: true }} />
        );
      case "zodiacSignData":
        return (
          <Pie data={chartData.zodiacSignData} options={{ maintainAspectRatio: true }} />
        );
      case "countryData":
        return (
          <Pie data={chartData.countryData} options={{ maintainAspectRatio: true }} />
        );
      case "securityLevels":
        return (
          <Bar
            data={{
              labels: ["Nivel 2", "Nivel 3"],
              datasets: [
                {
                  label: "Usuarios por Nivel de Seguridad",
                  data: [
                    chartData.securityLevels.level2,
                    chartData.securityLevels.level3,
                  ],
                  backgroundColor: ["#4caf50", "#ff9800"],
                },
              ],
            }}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "deceasedUsers":
        return (
          <div className="deceased-users">
            <h3>Usuarios Descansando</h3>
            <ul>
              {chartData.deceasedUsers.length > 0 ? (
                chartData.deceasedUsers.map((user, index) => (
                  <li key={index}>{user}</li>
                ))
              ) : (
                <p>No hay usuarios descansando.</p>
              )}
            </ul>
          </div>
        );
      default:
        return <p>Selecciona un gráfico.</p>;
    }
  };

  return (
    <div className="graph-container">
      <h2>Gráficos de Uso</h2>
      <div className="graph-filter-buttons">
        <button onClick={() => setSelectedChart("weeklyUsage")}>Uso Semanal</button>
        <button onClick={() => setSelectedChart("hourlyRange")}>Rango de Horas</button>
        <button onClick={() => setSelectedChart("emotionData")}>Emociones</button>
        <button onClick={() => setSelectedChart("zodiacSignData")}>
          Signos Zodiacales
        </button>
        <button onClick={() => setSelectedChart("countryData")}>País</button>
        <button onClick={() => setSelectedChart("securityLevels")}>
          Niveles de Seguridad
        </button>
        <button onClick={() => setSelectedChart("deceasedUsers")}>
          Usuarios Descansando
        </button>
      </div>

      <div className="graph-section">{renderChart()}</div>
      <ExportButtons data={chartData} />
    </div>
  );
};

export default Graphics;
