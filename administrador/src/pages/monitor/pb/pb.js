import React, { useState, useEffect } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./pb.css"; // Importa el CSS
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Cambiar a tu configuración

// Filtros iniciales
const initialFilters = {
  entradas: false,
  emociones: false,
  seguridad: false,
  sesiones: false,
  categorias: false,
  tiempo: false,
  edad: false,
  sector: false,
};

// Tipos de gráficos disponibles
const chartTypes = ["Barras", "Líneas", "Circular"];

// Componente principal
const AnalysisPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [charts, setCharts] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState("Barras");
  const [xAxisFilter, setXAxisFilter] = useState("");
  const [yAxisFilter, setYAxisFilter] = useState("");
  const [data, setData] = useState({ entries: [], sessions: [], users: [] });

  const DraggableFilter = ({ filter }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "filter",
      item: { filter },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });

    return (
      <div ref={drag} className={`filter-item ${isDragging ? "dragging" : ""}`}>
        {filter}
      </div>
    );
  };

  // Carga de datos desde Firebase
  useEffect(() => {
    const fetchData = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      const entriesData = entriesSnapshot.docs.map((doc) => doc.data());
      const sessionsData = sessionsSnapshot.docs.map((doc) => doc.data());
      const usersData = usersSnapshot.docs.map((doc) => doc.data());

      setData({
        entries: entriesData,
        sessions: sessionsData,
        users: usersData,
      });
      console.log("Datos obtenidos de Firebase:", {
        entries: entriesData,
        sessions: sessionsData,
        users: usersData,
      });
    };

    fetchData();
  }, []);

  // Cálculo de la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchData = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      const entriesData = entriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const sessionsData = sessionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combinación de datos de entradas y usuarios
      const combinedEntries = entriesData.map((entry) => {
        const user = usersData.find((u) => u.id === entry.userId);
        return {
          ...entry,
          user,
        };
      });

      setData({
        entries: combinedEntries,
        sessions: sessionsData,
        users: usersData,
      });

      console.log("Datos combinados cargados:", {
        entries: combinedEntries,
        sessions: sessionsData,
        users: usersData,
      });
    };

    fetchData();
  }, []);

  // Procesar filtros
  const processFilters = () => {
    if (!xAxisFilter || !yAxisFilter) return [];
    const { entries, sessions, users } = data;

    let filteredData = [];

    if (xAxisFilter === "edad" || yAxisFilter === "edad") {
      filteredData = entries.map((entry) => {
        const user = users.find((u) => u.id === entry.userId);
        if (!user) return null;

        const birthDate = user?.birthDate?.seconds
          ? new Date(user.birthDate.seconds * 1000)
          : null;
        const age = birthDate ? calculateAge(birthDate) : "Desconocido";

        const yValue =
          yAxisFilter === "entradas"
            ? 1
            : yAxisFilter === "emociones"
            ? entry.emociones?.length || 0
            : yAxisFilter === "seguridad"
            ? entry.nivel === "nivel 3"
              ? 3
              : entry.nivel === "nivel 2"
              ? 2
              : 1
            : 0;

        return { x: age, y: yValue };
      });
    } else if (xAxisFilter === "categorias") {
      const categoryCounts = entries.reduce((acc, entry) => {
        acc[entry.categoria] = (acc[entry.categoria] || 0) + 1;
        return acc;
      }, {});

      filteredData = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          x: category,
          y: count,
        })
      );
    } else if (xAxisFilter === "emociones") {
      const emotionCounts = entries.reduce((acc, entry) => {
        entry.emociones?.forEach((emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1;
        });
        return acc;
      }, {});

      filteredData = Object.entries(emotionCounts).map(([emotion, count]) => ({
        x: emotion,
        y: count,
      }));
    }

    return filteredData.filter((d) => d !== null);
  };

  // Agregar un nuevo gráfico
  const addChart = () => {
    if (!xAxisFilter || !yAxisFilter) {
      alert("Por favor, selecciona filtros para ambos ejes.");
      return;
    }

    const filteredData = processFilters(); // Procesar datos según los filtros seleccionados

    // Formatear los datos para Chart.js
    const formattedData = {
      labels: filteredData.map((item) => item.x),
      datasets: [
        {
          label: `${yAxisFilter} por ${xAxisFilter}`,
          data: filteredData.map((item) => item.y),
          backgroundColor: filteredData.map((_, index) =>
            index % 2 === 0 ? "rgba(54,162,235,0.5)" : "rgba(255,99,132,0.5)"
          ),
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1,
        },
      ],
    };

    console.log("Datos formateados para el gráfico:", formattedData);

    if (
      !formattedData.labels.length ||
      !formattedData.datasets[0].data.length
    ) {
      console.warn("Los datos para el gráfico están incompletos.");
      alert("No se generaron datos para los filtros seleccionados.");
      return;
    }

    if (
      !formattedData.labels.length ||
      !formattedData.datasets[0].data.length
    ) {
      console.warn("Los datos para el gráfico están incompletos.");
      alert("No se generaron datos para los filtros seleccionados.");
      return;
    }

    console.log("Datos formateados para el gráfico:", formattedData);

    // Validar si los datos están vacíos
    if (
      !formattedData.labels.length ||
      !formattedData.datasets[0].data.length
    ) {
      console.warn("Los datos para el gráfico están incompletos.");
      alert("No se generaron datos para los filtros seleccionados.");
      return;
    }

    // Agregar el gráfico al estado
    setCharts([
      ...charts,
      {
        type: selectedChartType,
        data: formattedData, // Usar los datos formateados aquí
      },
    ]);
  };

  // Detección de arrastre y soltar para filtros
  const handleDrop = (axis, item) => {
    if (axis === "x") {
      setXAxisFilter(item.filter);
      console.log("Filtro Eje X seleccionado:", item.filter);
    }
    if (axis === "y") {
      setYAxisFilter(item.filter);
      console.log("Filtro Eje Y seleccionado:", item.filter);
    }
  };

  const [{ isOverX }, dropX] = useDrop({
    accept: "filter",
    drop: (item) => handleDrop("x", item),
    collect: (monitor) => ({
      isOverX: !!monitor.isOver(),
    }),
  });

  const [{ isOverY }, dropY] = useDrop({
    accept: "filter",
    drop: (item) => handleDrop("y", item),
    collect: (monitor) => ({
      isOverY: !!monitor.isOver(),
    }),
  });

  return (
    <div className="analysis-container">
      {/* Panel izquierdo */}
      <div className="filters-panel">
        <h3>Tipo de Gráfico</h3>
        {chartTypes.map((type) => (
          <div key={type}>
            <input
              type="radio"
              name="chart-type"
              value={type}
              checked={selectedChartType === type}
              onChange={() => setSelectedChartType(type)}
            />
            <label>{type}</label>
          </div>
        ))}

        <h3>Filtros Disponibles</h3>
        <div className="available-filters">
          {Object.keys(initialFilters).map((filter) => (
            <DraggableFilter key={filter} filter={filter} />
          ))}
        </div>

        <h3>Insertar Filtro</h3>
        <div className="filter-boxes">
          <div
            ref={dropX}
            className={`filter-box ${isOverX ? "highlight" : ""}`}
          >
            {xAxisFilter || "Eje X"}
          </div>
          <div
            ref={dropY}
            className={`filter-box ${isOverY ? "highlight" : ""}`}
          >
            {yAxisFilter || "Eje Y"}
          </div>
        </div>

        <button
          onClick={() => {
            if (!xAxisFilter || !yAxisFilter) {
              alert("Por favor, selecciona filtros para ambos ejes.");
              return;
            }
            addChart();
          }}
        >
          Añadir Gráfico
        </button>
      </div>

      {/* Panel derecho */}
      <div className="charts-panel">
        {charts.map((chart, index) => (
          <div key={index} className="chart-container">
            {chart.type === "Barras" && chart.data && <Bar data={chart.data} />}
            {chart.type === "Líneas" && chart.data && (
              <Line data={chart.data} />
            )}
            {chart.type === "Circular" && chart.data && (
              <Pie data={chart.data} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPage;
