import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import "./pb.css";

// Configuración inicial
const initialFilters = {
  entradas: false,
  emociones: false,
  seguridad: false,
  sesiones: false,
  sector: "",
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
  const [sectorSwitch, setSectorSwitch] = useState(false); // Controla si el switch está activo o no

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

  // Obtener el sector seleccionado (país, ciudad, comuna)
  const getSectorKey = (filters) => {
    if (filters.sector) {
      const options = ["país", "ciudad", "comuna"];
      return options.find((opt) => filters[opt]);
    }
    return null;
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
  // Maneja el estado del switch de sector
  const handleSectorSwitch = () => {
    setSectorSwitch((prev) => !prev); // Alterna el estado del switch
  };

  // Maneja el tipo de sector seleccionado
  const handleSectorTypeChange = (chartId, sectorType) => {
    setChartsConfig((prev) =>
      prev.map((chart) =>
        chart.id === chartId
          ? {
              ...chart,
              filters: {
                ...chart.filters,
                sector: sectorType, // Actualiza el sector seleccionado
              },
            }
          : chart
      )
    );
  };

  // Manejo del tipo de gráfico
  const handleChartTypeChange = (chartId, type) => {
    setChartsConfig((prev) =>
      prev.map((chart) =>
        chart.id === chartId ? { ...chart, chartType: type } : chart
      )
    );
  };

  // Manejo del filtro de sector
  const handleSectorChange = (chartId, sectorType) => {
    setChartsConfig((prev) =>
      prev.map((chart) =>
        chart.id === chartId
          ? {
              ...chart,
              filters: {
                ...chart.filters,
                sector: sectorType, // Actualizar el sector seleccionado
              },
            }
          : chart
      )
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
          const usersSnapshot = await getDocs(collection(db, "users"));
          const usersData = usersSnapshot.docs.reduce((acc, doc) => {
            const user = doc.data();
            acc[doc.id] = user; // Usa el ID del usuario como clave
            return acc;
          }, {});
          const entriesData = entriesSnapshot.docs.map((doc) => doc.data());

          const combinedData = {};

          // Procesar y combinar datos
          entriesData.forEach((entry) => {
            const entryDate = new Date(entry.fechaCreacion.seconds * 1000);
            if (entryDate >= startDate && entryDate <= endDate) {
              const dateKey = entryDate.toLocaleDateString();
              if (!combinedData[dateKey])
                combinedData[dateKey] = {
                  entradas: 0,
                  emociones: 0,
                  seguridad: 0,
                  sesiones: 0,
                  sector: 0,
                };

              // Filtros de entradas
              if (filters.entradas) combinedData[dateKey].entradas += 1;

              // Filtros de emociones
              if (filters.emociones) {
                (entry.emociones || []).forEach((emotion) => {
                  combinedData[dateKey].emociones += 1;
                });
              }

              // Filtros de seguridad
              if (filters.seguridad) {
                combinedData[dateKey].seguridad += entry.isProtected ? 1 : 0;
              }

              // Filtros de sector
              if (filters.sector) {
                const sectorKey = filters.sector; // "país", "ciudad" o "comuna"
                const userId = entry.userId; // Supongamos que `entry` tiene un campo `userId`

                if (
                  userId &&
                  usersData[userId] &&
                  usersData[userId][sectorKey]
                ) {
                  const sectorValue = usersData[userId][sectorKey];
                  if (!combinedData[dateKey].sectorCounts)
                    combinedData[dateKey].sectorCounts = {};
                  if (!combinedData[dateKey].sectorCounts[sectorValue])
                    combinedData[dateKey].sectorCounts[sectorValue] = 0;
                  combinedData[dateKey].sectorCounts[sectorValue] += 1;
                }
              }
            }
          });

          // Procesar sesiones
          if (filters.sesiones) {
            const sessionSnapshot = await getDocs(collection(db, "sessions"));
            const sessions = sessionSnapshot.docs.map((doc) => doc.data());

            for (const session of sessions) {
              const sessionDate = new Date(
                session.timestamp.seconds * 1000
              ).toLocaleDateString();
              if (!combinedData[sessionDate]) {
                combinedData[sessionDate] = {
                  entradas: 0,
                  emociones: 0,
                  seguridad: 0,
                  sesiones: 0,
                  sector: 0,
                };
              }
              combinedData[sessionDate].sesiones += 1;
            }
          }

          fetchedData.labels = Object.keys(combinedData);

          // Construir datasets
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
          if (filters.seguridad) {
            datasets.push({
              label: "Seguridad",
              data: Object.values(combinedData).map((d) => d.seguridad),
              backgroundColor: "rgba(54, 162, 235, 0.5)",
              borderColor: "rgba(54, 162, 235, 1)",
            });
          }
          if (filters.sector) {
            datasets.push({
              label: `Sector (${getSectorKey(filters)})`,
              data: Object.values(combinedData).map((d) => d.sector),
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderColor: "rgba(153, 102, 255, 1)",
            });
          }
          if (filters.sesiones) {
            datasets.push({
              label: "Sesiones",
              data: Object.values(combinedData).map((d) => d.sesiones),
              backgroundColor: "rgba(255, 206, 86, 0.5)",
              borderColor: "rgba(255, 206, 86, 1)",
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
      {/* Barra lateral */}
      <div className="pb-sidebar">
        <h3>Filtros</h3>

        {/* Controles para gráficos */}
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
                    <label htmlFor={`filter-${chart.id}-${filter}`}>
                      {filter}
                    </label>
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
                    <label htmlFor={`chart-type-${chart.id}-${type}`}>
                      {type}
                    </label>
                  </div>
                ))}
              </div>

              {/* Switch para habilitar/ocultar el filtro de sector */}
              <div className="pb-chart-sector-switch">
                <label htmlFor={`sector-switch-${chart.id}`}>Sector</label>
                <input
                  type="checkbox"
                  id={`sector-switch-${chart.id}`}
                  checked={sectorSwitch}
                  onChange={handleSectorSwitch}
                />
              </div>

              {/* Filtros de sector visibles solo si el switch está activado */}
              {sectorSwitch && (
                <div className="pb-chart-sector">
                  <h5>Filtros de Sector</h5>
                  {["país", "ciudad", "comuna"].map((sectorType) => (
                    <div key={sectorType} className="pb-filter-option">
                      <input
                        type="radio"
                        name={`sector-${chart.id}`}
                        id={`sector-${chart.id}-${sectorType}`}
                        checked={chart.filters.sector === sectorType}
                        onChange={() =>
                          handleSectorTypeChange(chart.id, sectorType)
                        }
                      />
                      <label htmlFor={`sector-${chart.id}-${sectorType}`}>
                        {sectorType}
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para eliminar gráfico */}
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

        {/* Botón para agregar gráficos */}
        {chartsConfig.length < 3 && (
          <button className="pb-add-chart" onClick={addNewChart}>
            Añadir Gráfico
          </button>
        )}

        {/* Filtros de tiempo */}
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

      {/* Contenedor de gráficos */}
      <div className="pb-charts">
        {chartsConfig.map((chart) => (
          <div key={chart.id} className="pb-chart">
            <h4>Gráfico {chart.id}</h4>
            {chartData[chart.id] ? (
              chart.chartType === "Barras" ? (
                <Bar
                  data={chartData[chart.id]}
                  options={{ responsive: true }}
                />
              ) : chart.chartType === "Líneas" ? (
                <Line
                  data={chartData[chart.id]}
                  options={{ responsive: true }}
                />
              ) : (
                <Pie
                  data={chartData[chart.id]}
                  options={{ responsive: true }}
                />
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
