import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Line, Pie } from "react-chartjs-2";
import 'chart.js/auto';
import './graph.css'; 

const UsageCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [dailyData, setDailyData] = useState(null); 
  const [categoryData, setCategoryData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");

  // const toggleTheme = () => {
  //   setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  // };

  const fetchUsageData = async () => {
    try {
      const usageData = [];
      const dailyUsage = {};
      const categoryCount = {}; 
      const q = query(collection(db, "entradas"), orderBy("fechaCreacion"));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fechaCreacion = data.fechaCreacion.toDate();
        const hora = fechaCreacion.getHours();
        const dia = fechaCreacion.toLocaleDateString(); 
        const categoria = data.categoria || "Sin categoría"; 

        if (categoryCount[categoria]) {
          categoryCount[categoria]++;
        } else {
          categoryCount[categoria] = 1;
        }

        if (dailyUsage[dia]) {
          dailyUsage[dia]++;
        } else {
          dailyUsage[dia] = 1;
        }

        usageData.push({ hora, fechaCreacion });
      });

      const usagePerHour = Array(24).fill(0);
      usageData.forEach((entry) => {
        usagePerHour[entry.hora]++;
      });

      const historicalAverage = Array(24).fill(5);

      const categoryLabels = Object.keys(categoryCount);
      const categoryValues = Object.values(categoryCount);

      setChartData({
        labels: [...Array(24).keys()],
        datasets: [
          {
            label: "Uso de usuarios por hora",
            data: usagePerHour,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            borderWidth: 1, // Reduce el grosor para mejorar la claridad
            fill: true,
          },
          {
            label: "Promedio de usuarios por hora",
            data: historicalAverage,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 1, // Reduce el grosor para mejorar la claridad
            fill: true,
          },
        ],
      });
      

      setDailyData({
        labels: Object.keys(dailyUsage), 
        datasets: [
          {
            label: "Uso diario de usuarios",
            data: Object.values(dailyUsage), 
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
          },
        ],
      });

      setCategoryData({
        labels: categoryLabels, 
        datasets: [
          {
            label: "Porcentaje de Categorías Usadas",
            data: categoryValues, 
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ], 
            hoverBackgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("Error obteniendo datos de uso:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (!chartData || !dailyData || !categoryData) {
    return <p>No hay datos disponibles.</p>;
  }

  return (
    <div className={`dashboard-container`}>
      {/* Contenedor para los filtros
      <div className="filters-container">
        <button onClick={toggleTheme} className="theme-button">Cambiar Tema</button>
        <button className="filter-button">Filtro por Hora</button>
        <button className="filter-button">Filtro por Categoría</button>
        <button className="filter-button">Filtro por Uso Diario</button>
      </div> */}

      {/* Contenedor para los gráficos */}
      <div className="chart-wrapper">
        {/* Gráfico de líneas de uso de usuarios por hora */}
        <div className="chart-container">
          <h1>Uso de Usuarios por Hora</h1>
          <Line data={chartData} />
        </div>

        {/* Gráfico de uso diario */}
        <div className="chart-container">
          <h1>Uso Diario de Usuarios</h1>
          <Line data={dailyData} />
        </div>

        {/* Gráfico de torta para categorías */}
        <div className="chart-container">
          <h1>Categorías Usadas</h1>
          <Pie data={categoryData} />
        </div>
      </div>
    </div>
  );
};

export default UsageCharts;
