import React, { useState, useEffect } from "react";
import { fetchUsageData, fetchStorageData } from "./graphs/dataService";
import ExportButtons from "./graphs/exportButtons";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./graphs.css";
import Modal from "./graphs/modal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
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

  const handleButtonClick = (chartType) => {
    setSelectedChart(chartType);
    setModalContent(`Detalles del gráfico: ${chartType}`);
    setIsModalOpen(true);
  };

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

  const getWeeklyUsageDetails = () => {
    const { countryData, emotionData } = chartData; // Datos de países y emociones
    const mostFrequentEmotion = Object.keys(emotionData.datasets[0].data).reduce((a, b) =>
      emotionData.datasets[0].data[a] > emotionData.datasets[0].data[b] ? a : b
    );

    const details = `
      País con mayor actividad: ${
        Object.keys(countryData.datasets[0].data)[0]
      } 
      Emoción más frecuente: ${mostFrequentEmotion}
    `;
    return details;
  };

  const getHourlyUsageDetails = () => {
    const { hourlyRangeData, emotionData } = chartData;
    const mostFrequentRange = Object.keys(hourlyRangeData.datasets[0].data).reduce((a, b) =>
      hourlyRangeData.datasets[0].data[a] > hourlyRangeData.datasets[0].data[b] ? a : b
    );

    const mostFrequentEmotion = Object.keys(emotionData.datasets[0].data).reduce((a, b) =>
      emotionData.datasets[0].data[a] > emotionData.datasets[0].data[b] ? a : b
    );

    const details = `
      Rango de horas con mayor actividad: ${mostFrequentRange}
      Emoción más frecuente durante este rango: ${mostFrequentEmotion}
    `;
    return details;
  };

  const handleOpenModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
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
        <button>descargar xlxs</button>
      <div className="graph-grid">
        <div className="graph-item">
        <button onClick={() => handleOpenModal(getWeeklyUsageDetails())}>
        Ver mas detlalle</button>
          <Bar data={chartData.weeklyData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal(getHourlyUsageDetails())}>
        Ver mas detlalle</button>
          <Bar data={chartData.hourlyRangeData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Detalles de Emociones")}>
          Ver mas detlalle</button>
          <Pie data={chartData.emotionData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Detalles de Signos Zodiacales")}>

          Ver mas detlalle</button>
          <Pie data={chartData.zodiacSignData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Detalles de Categorías")}>

          Ver mas detlalle</button>
          <Bar data={chartData.categoryUsageData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Detalles de Creaciones Diarias")}>
        Ver mas detlalle</button>
          <Line data={chartData.dailyCreationsData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Pais y Ciudades")}>

          Ver mas detlalle</button>
          <Pie data={chartData.countryData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Usuarios verificados")}>
          Ver mas detlalle</button>
          <Pie data={chartData.verifiedUserData} options={{ maintainAspectRatio: true }} />
        </div>
        <div className="graph-item">
        <button onClick={() => handleOpenModal("Almacenamiento")}>
          Ver mas detlalle</button>
          <Bar data={chartData.storageUsageData} options={{ maintainAspectRatio: true }} />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={modalContent}
      />
    </div>
  );
};

export default Graphics;
