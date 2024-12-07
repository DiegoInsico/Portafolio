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
  const generalColors = ["#76A5AF", "#E6CBA1", "#D0E1F9"];


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

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true }, // Apilado en el eje X
      y: { stacked: true }, // Apilado en el eje Y
    },
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
      const validateCircularFilters = (filters) => {
        const activeFilters = [
          "entradas",
          "emociones",
          "seguridad",
          "sesiones",
        ].filter((key) => filters[key]);
        return activeFilters.length === 4; // Solo 2 filtros permitidos
      };

      for (const chart of chartsConfig) {
        const { filters } = chart;
        const fetchedData = { labels: [], datasets: [] };

        // Verificar si al menos un filtro está activado
        if (Object.values(filters).some((v) => v)) {
          // Obtener datos de Firebase
          const entriesSnapshot = await getDocs(collection(db, "entradas"));
          const usersSnapshot = await getDocs(collection(db, "users"));

          // Procesar datos de usuarios
          const usersData = usersSnapshot.docs.reduce((acc, doc) => {
            const user = doc.data();
            acc[doc.id] = user; // Usa el ID del usuario como clave
            return acc;
          }, {});

          // Procesar datos de entradas
          const entriesData = entriesSnapshot.docs.map((doc) => doc.data());
          const combinedData = {};

          entriesData.forEach((entry) => {
            const entryDate = new Date(entry.fechaCreacion.seconds * 1000);
            if (entryDate >= startDate && entryDate <= endDate) {
              const dateKey = entryDate.toLocaleDateString();

              if (!combinedData[dateKey]) {
                combinedData[dateKey] = {
                  entradas: 0,
                  emociones: 0,
                  seguridad: 0,
                  sesiones: 0,
                  sector: 0,
                  securityLevels: { nivel1: 0, nivel2: 0, nivel3: 0 },
                };
              }

              // Filtros de entradas
              if (filters.entradas) {
                combinedData[dateKey].entradas += 1;
              }

              // Filtros de emociones
              if (filters.emociones) {
                (entry.emociones || []).forEach(() => {
                  combinedData[dateKey].emociones += 1;
                });
              }

              // Filtros de seguridad
              if (filters.seguridad) {
                const securityLevel = parseInt(entry.nivel) || 1; // Nivel predeterminado 1
                if (securityLevel === 1) {
                  combinedData[dateKey].securityLevels.nivel1 += 1;
                } else if (securityLevel === 2) {
                  combinedData[dateKey].securityLevels.nivel2 += 1;
                } else if (securityLevel === 3) {
                  combinedData[dateKey].securityLevels.nivel3 += 1;
                }
              }

              // Filtros de sector
              if (filters.sector) {
                const sectorKey = filters.sector; // "país", "ciudad", "comuna"
                const userId = entry.userId; // Relación de entrada con usuario

                if (
                  userId &&
                  usersData[userId] &&
                  usersData[userId][sectorKey]
                ) {
                  const sectorValue = usersData[userId][sectorKey];
                  if (!combinedData[dateKey].sectorCounts) {
                    combinedData[dateKey].sectorCounts = {};
                  }
                  if (!combinedData[dateKey].sectorCounts[sectorValue]) {
                    combinedData[dateKey].sectorCounts[sectorValue] = 0;
                  }
                  combinedData[dateKey].sectorCounts[sectorValue] += 1;
                }
              }
            }
          });

          // Procesar sesiones
          if (filters.sesiones) {
            const sessionSnapshot = await getDocs(collection(db, "sessions"));
            const sessions = sessionSnapshot.docs.map((doc) => doc.data());

            sessions.forEach((session) => {
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
                  securityLevels: { nivel1: 0, nivel2: 0, nivel3: 0 },
                };
              }

              combinedData[sessionDate].sesiones += 1;
            });
          }

          // Construcción de labels y datasets
          fetchedData.labels = Object.keys(combinedData);
          const datasets = [];

          // Dataset de seguridad por niveles
          if (filters.seguridad) {
            const securityLevels = Object.values(combinedData).map(
              (d) => d.securityLevels || { nivel1: 0, nivel2: 0, nivel3: 0 }
            );

            datasets.push({
              label: "Nivel 1 (Bajo)",
              data: securityLevels.map((levels) => levels.nivel1),
              backgroundColor: "rgba(76, 175, 80, 0.7)", // Verde
              stack: "Seguridad",
            });

            datasets.push({
              label: "Nivel 2 (Medio)",
              data: securityLevels.map((levels) => levels.nivel2),
              backgroundColor: "rgba(255, 152, 0, 0.7)", // Naranja
              stack: "Seguridad",
            });

            datasets.push({
              label: "Nivel 3 (Alto)",
              data: securityLevels.map((levels) => levels.nivel3),
              backgroundColor: "rgba(244, 67, 54, 0.7)", // Rojo
              stack: "Seguridad",
            });
          }

          // Otros datasets
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

          if (filters.sector) {
            datasets.push({
              label: `Sector (${filters.sector})`,
              data: Object.values(combinedData).map((d) => {
                const sectorCounts = d.sectorCounts || {};
                return Object.values(sectorCounts).reduce((a, b) => a + b, 0);
              }),
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

          if (chart.chartType === "Circular") {
            if (!validateCircularFilters(filters)) {
              alert(
                "Los gráficos circulares solo admiten exactamente 2 filtros seleccionados."
              );
              continue; // Omitimos este gráfico
            }
          
            const activeFilters = [
              "entradas",
              "emociones",
              "seguridad",
              "sesiones",
            ].filter((key) => filters[key]);
          
            const circularData = Object.values(combinedData).reduce((acc, curr) => {
              activeFilters.forEach((filter) => {
                acc[filter] = (acc[filter] || 0) + (curr[filter] || 0);
              });
              return acc;
            }, {});
          
            fetchedData.labels = activeFilters.map(
              (key) => key.charAt(0).toUpperCase() + key.slice(1)
            );
            fetchedData.datasets = [
              {
                label: "Datos Circular",
                data: activeFilters.map((key) => circularData[key] || 0),
                backgroundColor: ["#76A5AF", "#E6CBA1", "#D0E1F9"], // Colores más formales
              },
            ];
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
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: "top" },
              },
              scales: {
                x: { grid: { display: false } },
                y: {
                  grid: { display: true },
                  beginAtZero: true,
                },
              },
            }} // Opciones específicas de barras
          />
        ) : chart.chartType === "Líneas" ? (
          <Line
            data={chartData[chart.id]}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: "top" },
              },
              scales: {
                x: {
                  grid: { display: false },
                  title: { display: true, text: "Fechas" },
                },
                y: {
                  grid: { display: true },
                  beginAtZero: true,
                  title: { display: true, text: "Valores" },
                },
              },
            }} // Opciones específicas de líneas
          />
        ) : (
          <Pie
            data={chartData[chart.id]}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      const label = tooltipItem.label || "";
                      const value = tooltipItem.raw || 0;
                      return `${label}: ${value}`;
                    },
                  },
                },
                legend: { display: true, position: "top" },
              },
            }} // Opciones específicas de pie
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
