import React, { useState, useEffect } from "react";
import { fetchUsageData } from "./graphs/dataService";
import { Bar, Pie, Line } from "react-chartjs-2";
import "./graphs.css";
import Modal from "./graphs/modal";
import StorageUsage from "./storage/storageUsage";

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
        console.log("Datos cargados:", usageData); // Verifica los datos cargados
        setChartData(usageData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
        {/* Categorías Más Usadas */}
        <div className="graph-item">
          <button
            onClick={() =>
              handleOpenModal(
                <>
                  <h3>Categorías Más Usadas</h3>
                  {renderGraph(chartData.categoryUsageData, "Bar")}
                  <h4>Complementos</h4>
                  {renderGraph(chartData.hourlyRangeData, "Bar")}
                  {renderGraph(chartData.zodiacSignData, "Pie")}
                </>
              )
            }
          >
            Ver más detalle
          </button>
          {renderGraph(chartData.categoryUsageData, "Bar")}
        </div>

        {/* Uso Semanal */}
        <div className="graph-item">
          <button
            onClick={() =>
              handleOpenModal(
                <>
                  <h3>Uso Semanal</h3>
                  {renderGraph(chartData.weeklyData, "Bar")}
                  <h4>Complementos</h4>
                  {renderGraph(chartData.dailyCreationsData, "Line")}
                  {renderGraph(chartData.countryData, "Pie")}
                </>
              )
            }
          >
            Ver más detalle
          </button>
          {renderGraph(chartData.weeklyData, "Bar")}
        </div>

        {/* Distribución Geográfica */}
        <div className="graph-item">
          <button
            onClick={() =>
              handleOpenModal(
                <>
                  <h3>Distribución Geográfica</h3>
                  {renderGraph(chartData.countryData, "Pie")}
                  <h4>Complementos</h4>
                  {renderGraph(chartData.verifiedUserData, "Pie")}
                  {renderGraph(chartData.storageUsageData, "Bar")}
                </>
              )
            }
          >
            Ver más detalle
          </button>
          {renderGraph(chartData.countryData, "Pie")}
        </div>
      </div>

      {/* Gráfico de Uso de Almacenamiento Directo */}
      <div className="storage-usage-section">
        <h2>Uso de Almacenamiento</h2>
        <StorageUsage />
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
