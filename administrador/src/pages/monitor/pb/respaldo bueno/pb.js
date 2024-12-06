import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajustar la ruta según tu estructura
import "./pb.css"; // Estilos personalizados
// Configuración inicial
const initialFilters = {
  entradas: false,
  emociones: false,
  seguridad: false,
  sesiones: false,
  sector: false,
};

// Opciones de tiempo y gráficos
const timeOptions = ["año", "mes", "día"];
const chartTypes = ["Barras", "Líneas", "Circular"];
const AnalysisPage = () => {
  const [chartsConfig, setChartsConfig] = useState([
    { id: 1, filters: { ...initialFilters }, chartType: "Barras" },
  ]);
  const [timeFilter, setTimeFilter] = useState("año");
  const [chartData, setChartData] = useState({});

  // Rango de fechas según el filtro de tiempo
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (timeFilter === "año") {
      startDate = new Date(now.getFullYear(), 0, 1); // 1 de enero
      endDate = new Date(now.getFullYear(), 11, 31); // 31 de diciembre
    } else if (timeFilter === "mes") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes
    } else if (timeFilter === "día") {
      startDate = new Date(now.setHours(0, 0, 0, 0)); // Hoy a medianoche
      endDate = new Date(now.setHours(23, 59, 59, 999)); // Hoy al final del día
    }

    return { startDate, endDate };
  };

  // Manejo de filtros
  const handleFilterChange = (chartId, filterName) => {
    setChartsConfig((prev) =>
      prev.map((chart) =>
        chart.id === chartId
          ? {
              ...chart,
              filters: {
                ...chart.filters,
                [filterName]: !chart.filters[filterName],
              },
            }
          : chart
      )
    );
  };

  // Manejo del tipo de gráfico
  const handleChartTypeChange = (chartId, type) => {
    setChartsConfig((prev) =>
      prev.map((chart) => (chart.id === chartId ? { ...chart, chartType: type } : chart))
    );
  };

  // Agregar un nuevo gráfico
  const addNewChart = () => {
    if (chartsConfig.length >= 3) {
      alert("Solo puedes agregar hasta 3 gráficos.");
      return;
    }
    setChartsConfig((prev) => [
      ...prev,
      { id: Date.now(), filters: { ...initialFilters }, chartType: "Barras" },
    ]);
  };

  // Eliminar un gráfico
  const removeChart = (chartId) => {
    setChartsConfig((prev) => prev.filter((chart) => chart.id !== chartId));
  };

  // Cargar datos y combinar filtros
  useEffect(() => {
    const fetchData = async () => {
      const { startDate, endDate } = getDateRange();
      const allData = {};

      for (const chart of chartsConfig) {
        const { filters } = chart;
        const fetchedData = { labels: [], datasets: [] };

        if (Object.values(filters).some((v) => v)) {
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const entriesData = entriesSnapshot.docs.map((doc) => doc.data());

          const combinedData = {};
          entriesData.forEach((entry) => {
            const entryDate = new Date(entry.fechaCreacion.seconds * 1000);
            if (entryDate >= startDate && entryDate <= endDate) {
              const dateKey = entryDate.toLocaleDateString();
              if (!combinedData[dateKey]) combinedData[dateKey] = { entradas: 0, emociones: 0 };

              if (filters.entradas) combinedData[dateKey].entradas += 1;
              if (filters.emociones) {
                (entry.emociones || []).forEach((emotion) => {
                  combinedData[dateKey].emociones += 1;
                });
              }
            }
          });

          fetchedData.labels = Object.keys(combinedData);
          const datasets = [];

          if (filters.entradas) {
            datasets.push({
              label: "Entradas",
              data: Object.values(combinedData).map((d) => d.entradas),
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
            });
          }

          if (filters.emociones) {
            datasets.push({
              label: "Emociones",
              data: Object.values(combinedData).map((d) => d.emociones),
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
            });
          }

          fetchedData.datasets = datasets;
        }

        allData[chart.id] = fetchedData;
      }

      setChartData(allData);
    };

    fetchData();
  }, [chartsConfig, timeFilter]);

  return (
    <div className="pb-container">
      {/* Sidebar */}
      <div className="pb-sidebar">
        <h3>Filtros</h3>
  
        {/* Lista de Gráficos */}
        <div className="pb-chart-controls">
          {chartsConfig.map((chart, index) => (
            <div key={chart.id} className="pb-chart-control">
              <h4>Gráfico {index + 1}</h4>
  
              {/* Filtros de selección */}
              <div className="pb-filters">
                {Object.keys(initialFilters).map((filter) => (
                  <div key={filter} className="pb-filter">
                    <input
                      type="checkbox"
                      id={`filter-${chart.id}-${filter}`}
                      checked={chart.filters[filter]}
                      onChange={() => handleFilterChange(chart.id, filter)}
                    />
                    <label htmlFor={`filter-${chart.id}-${filter}`}>{filter}</label>
                  </div>
                ))}
              </div>
  
              {/* Selección del tipo de gráfico */}
              <div className="pb-chart-type">
                <h5>Tipo de Gráfico</h5>
                {chartTypes.map((type) => (
                  <div key={type} className="pb-filter-option">
                    <input
                      type="radio"
                      name={`chart-type-${chart.id}`}
                      id={`chart-type-${chart.id}-${type}`}
                      checked={chart.chartType === type}
                      onChange={() => handleChartTypeChange(chart.id, type)}
                    />
                    <label htmlFor={`chart-type-${chart.id}-${type}`}>{type}</label>
                  </div>
                ))}
              </div>
  
              {/* Botón para eliminar el gráfico */}
              {chartsConfig.length > 1 && (
                <button
                  className="pb-remove-chart"
                  onClick={() => removeChart(chart.id)}
                >
                  Eliminar Gráfico
                </button>
              )}
            </div>
          ))}
        </div>
  
        {/* Botón para agregar un gráfico */}
        {chartsConfig.length < 3 && (
          <button className="pb-add-chart" onClick={addNewChart}>
            Añadir Gráfico
          </button>
        )}
  
        {/* Selección de tiempo */}
        <div className="pb-time-filters">
          <h4>Tiempo</h4>
          {timeOptions.map((option) => (
            <div key={option} className="pb-filter-option">
              <input
                type="radio"
                name="time-filter"
                id={`time-${option}`}
                checked={timeFilter === option}
                onChange={() => setTimeFilter(option)}
              />
              <label htmlFor={`time-${option}`}>{option}</label>
            </div>
          ))}
        </div>
      </div>
  
      {/* Gráficos */}
      <div className="pb-charts">
        {chartsConfig.map((chart) => (
          <div key={chart.id} className="pb-chart">
            <h4>Gráfico {chart.id}</h4>
            {chartData[chart.id] ? (
              chart.chartType === "Barras" ? (
                <Bar data={chartData[chart.id]} options={{ responsive: true }} />
              ) : chart.chartType === "Líneas" ? (
                <Line data={chartData[chart.id]} options={{ responsive: true }} />
              ) : (
                <Pie data={chartData[chart.id]} options={{ responsive: true }} />
              )
            ) : (
              <p>Cargando datos...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  
};

export default AnalysisPage;