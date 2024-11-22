import React, { useState, useEffect } from "react";
import { fetchUsageData, fetchStorageData } from "./graphs/dataService";
import ExportButtons from "./graphs/exportButtons";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./graphs.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement
);

const Graphics = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState("weeklyUsage");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usageData = await fetchUsageData();
        const storageData = await fetchStorageData();

        setChartData({
          ...usageData,
          storageUsageData: {
            labels: ["Imagen", "Video", "Audio", "Texto"],
            datasets: [
              {
                label: "Cantidad de Archivos",
                data: [
                  storageData.Imagen,
                  storageData.Video,
                  storageData.Audio,
                  storageData.Texto,
                ],
                backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"],
                borderColor: ["#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"],
                borderWidth: 1,
              },
            ],
          },
        });
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="graph-loading-container">
        <div className="graph-spinner"></div>
        <p className="graph-loading-text">Cargando datos, por favor espera...</p>
      </div>
    );
  }
  

  if (!chartData)
    return <p className="graph-error">No se pudieron cargar los datos.</p>;

  const renderChart = () => {
    switch (selectedChart) {
      case "weeklyUsage":
        return (
          <Bar
            data={chartData.weeklyData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "hourlyRange":
        return (
          <Bar
            data={chartData.hourlyRangeData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "emotionData":
        return (
          <Bar
            data={chartData.emotionData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "zodiacSignData":
        return (
          <Pie
            data={chartData.zodiacSignData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "categoryUsageData":
        return (
          <Bar
            data={chartData.categoryUsageData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "dailyCreationsData":
        return (
          <Line
            data={chartData.dailyCreationsData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "countryData":
        return (
          <Pie
            data={chartData.countryData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "verifiedUsers":
        return (
          <Pie
            data={chartData.verifiedUserData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "notifications":
        return (
          <Pie
            data={chartData.notificationsUserData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "premiumUserData":
        return (
          <Pie
            data={chartData.premiumUserData}
            options={{ maintainAspectRatio: true }}
          />
        );
      case "storageUsage":
        return (
          <Bar
            data={chartData.storageUsageData}
            options={{ maintainAspectRatio: true }}
          />
        );
      default:
        return <p>Selecciona un gráfico.</p>;
    }
  };

  if (loading) {
    return (
      <div className="graph-loading-container">
        <div className="graph-spinner"></div>
        <p className="graph-loading-text">Cargando datos, por favor espera...</p>
      </div>
    );
  }
  return (
    <div className="graph-container">
      <h2>Gráficos de Uso</h2>
      <div className="graph-filter-buttons">
        <button onClick={() => setSelectedChart("weeklyUsage")}>
          Uso Semanal
        </button>
        <button onClick={() => setSelectedChart("hourlyRange")}>
          Rangos de Horas
        </button>
        <button onClick={() => setSelectedChart("emotionData")}>
          Emociones
        </button>
        <button onClick={() => setSelectedChart("zodiacSignData")}>
          Signos Zodiacales
        </button>
        <button onClick={() => setSelectedChart("categoryUsageData")}>
          Categorías
        </button>
        <button onClick={() => setSelectedChart("dailyCreationsData")}>
          Creaciones Diarias
        </button>
        <button onClick={() => setSelectedChart("countryData")}>
          País
        </button>
        <button onClick={() => setSelectedChart("premiumUserData")}>
          Usuarios Premium
        </button>
        <button onClick={() => setSelectedChart("verifiedUsers")}>
          Usuarios Verificados
        </button>
        <button onClick={() => setSelectedChart("notifications")}>
          Notificaciones
        </button>
        <button onClick={() => setSelectedChart("storageUsage")}>
          Uso de Almacenamiento
        </button>
      </div>

      <div className="graph-section">{!loading && renderChart()}</div>
      <ExportButtons data={chartData} />
    </div>
  );
};

export default Graphics;
