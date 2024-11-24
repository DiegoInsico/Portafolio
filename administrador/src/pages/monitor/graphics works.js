// 
// necesito encontrar la diferencia de este con el
// original y porque este si carga y el otro no xd



import React, { useState, useEffect } from "react";
import { fetchUsageData } from "./graphs/dataService";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./graphs.css";
import Modal from "./graphs/modal";
import StorageUsage from "./storage/storageUsage";
import UserHeatmap from "./graphs/userHeatmap";
import moment from "moment";

const Graphics = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const usageData = await fetchUsageData();

        // Procesar datos de uso semanal directamente
        const weeklyData = processWeeklyData(usageData.creationsData);

        setChartData({
          ...usageData,
          weeklyData: {
            labels: weeklyData.map((data) => `Semana de ${data.week}`),
            datasets: [
              {
                label: "Creaciones Semanales",
                data: weeklyData.map((data) => data.count),
                backgroundColor: "#36A2EB",
                borderColor: "#007bff",
                fill: false,
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

  const processWeeklyData = (creationsData) => {
    const weeklyCounts = creationsData.reduce((acc, item) => {
      const creationDate = moment(item.fechaCreacion); // Suponiendo que es una fecha válida
      const weekStart = creationDate.startOf("isoWeek").format("YYYY-MM-DD"); // Agrupar por semana
      acc[weekStart] = (acc[weekStart] || 0) + 1;
      return acc;
    }, {});

    // Ordenar y convertir a formato usable
    return Object.keys(weeklyCounts)
      .sort((a, b) => moment(a).diff(moment(b)))
      .map((weekStart) => ({
        week: weekStart,
        count: weeklyCounts[weekStart],
      }));
  };

  const isValidData = (data) => {
    return data && data.labels && data.datasets && data.datasets.length > 0;
  };

  const renderGraph = (data, type = "Bar") => {
    if (!isValidData(data)) {
      return <p>Datos no disponibles</p>;
    }

    switch (type) {
      case "Bar":
        return <Bar data={data} options={{ maintainAspectRatio: true }} />;
      case "Pie":
        return <Pie data={data} options={{ maintainAspectRatio: true }} />;
      case "Line":
        return <Line data={data} options={{ maintainAspectRatio: true }} />;
      default:
        return <p>Tipo de gráfico no soportado</p>;
    }
  };

  const handleOpenModal = (content) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (!chartData) {
    return <p>No se pudieron cargar los datos.</p>;
  }

  return (
    <div className="graph-container">
      <h2>Gráficos Generales</h2>
      <div className="graph-grid">
        {/* Mapa de Calor */}
        <div className="map-item">
          <h3>Mapa de Calor de Usuarios</h3>
          <UserHeatmap />
        </div>

        {/* Categorías Más Usadas */}
        <div className="graph-item">
          <h3>Categorías Más Usadas</h3>
          {renderGraph(chartData.categoryUsageData, "Bar")}
          <button
            onClick={() =>
              handleOpenModal(
                <div>
                  <h3>Categorías Más Usadas</h3>
                  {renderGraph(chartData.categoryUsageData, "Bar")}
                </div>
              )
            }
          >
            Ver más detalle
          </button>
        </div>

        {/* Uso Semanal */}
        <div className="graph-item">
          <h3>Uso Semanal</h3>
          {renderGraph(chartData.weeklyData, "Line")}
          <button
            onClick={() =>
              handleOpenModal(
                <div>
                  <h3>Uso Semanal</h3>
                  {renderGraph(chartData.weeklyData, "Line")}
                </div>
              )
            }
          >
            Ver más detalle
          </button>
        </div>

        {/* Otros gráficos */}
        <div className="graph-item">
          <h3>Distribución Geográfica</h3>
          {renderGraph(chartData.countryData, "Pie")}
          <button
            onClick={() =>
              handleOpenModal(
                <div>
                  <h3>Distribución Geográfica</h3>
                  {renderGraph(chartData.countryData, "Pie")}
                </div>
              )
            }
          >
            Ver más detalle
          </button>
        </div>
      </div>

      {/* Gráfico de Uso de Almacenamiento */}
      <div className="storage-usage-section">
        <h2>Uso de Almacenamiento</h2>
        <StorageUsage />
      </div>

      {/* Modal para Detalles */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        content={modalContent}
      />
    </div>
  );
};

export default Graphics;
