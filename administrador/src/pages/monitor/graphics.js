import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Line, Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./graphs.css";
import Container from "../../components/container";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Graphics = () => {
  const [selectedChart, setSelectedChart] = useState("weeklyUsage");
  const [monthlyCategoryData, setMonthlyCategoryData] = useState(null);
  const [monthlyEmotionData, setMonthlyEmotionData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [hourlyRangeData, setHourlyRangeData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageData = async () => {
    try {
      const monthlyCategories = {};
      const monthlyEmotions = {};
      const weeklyUsage = {};
      const hourlyRangeUsage = {
        "0-3": 0,
        "4-7": 0,
        "8-11": 0,
        "12-15": 0,
        "16-19": 0,
        "20-23": 0,
      };
      const dailyUsage = {};
      const q = query(collection(db, "entradas"), orderBy("fechaCreacion"));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fechaCreacion = data.fechaCreacion.toDate();
        const hour = fechaCreacion.getHours();
        const day = fechaCreacion.toLocaleDateString();
        const category = data.categoria || "Sin categoría";
        const emotions = data.emociones || [];
        const month = fechaCreacion.toLocaleDateString("default", {
          month: "long",
          year: "numeric",
        });

        // Rango de horas
        if (hour >= 0 && hour <= 3) hourlyRangeUsage["0-3"]++;
        else if (hour >= 4 && hour <= 7) hourlyRangeUsage["4-7"]++;
        else if (hour >= 8 && hour <= 11) hourlyRangeUsage["8-11"]++;
        else if (hour >= 12 && hour <= 15) hourlyRangeUsage["12-15"]++;
        else if (hour >= 16 && hour <= 19) hourlyRangeUsage["16-19"]++;
        else if (hour >= 20 && hour <= 23) hourlyRangeUsage["20-23"]++;

        // Semana
        const startOfWeek = new Date(fechaCreacion);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        const weekLabel = `${startOfWeek.toLocaleDateString()} / ${endOfWeek.toLocaleDateString()}`;
        weeklyUsage[weekLabel] = (weeklyUsage[weekLabel] || 0) + 1;

        // Uso diario
        dailyUsage[day] = (dailyUsage[day] || 0) + 1;

        // Categorías por mes
        if (!monthlyCategories[month]) monthlyCategories[month] = {};
        monthlyCategories[month][category] =
          (monthlyCategories[month][category] || 0) + 1;

        // Emociones por mes
        emotions.forEach((emotion) => {
          if (!monthlyEmotions[month]) monthlyEmotions[month] = {};
          monthlyEmotions[month][emotion] =
            (monthlyEmotions[month][emotion] || 0) + 1;
        });
      });

      // Datos de uso semanal ordenado cronológicamente
      const sortedWeeks = Object.keys(weeklyUsage).sort(
        (a, b) => new Date(a.split(" / ")[0]) - new Date(b.split(" / ")[0])
      );

      setWeeklyData({
        labels: sortedWeeks,
        datasets: [
          {
            label: "Uso semanal de usuarios",
            data: sortedWeeks.map((week) => weeklyUsage[week]),
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
          },
        ],
      });

      setHourlyRangeData({
        labels: Object.keys(hourlyRangeUsage),
        datasets: [
          {
            label: "Uso por rango de horas",
            data: Object.values(hourlyRangeUsage),
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
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

      const categoryLabels = Object.keys(monthlyCategories);
      const categoryDatasets = Object.keys(
        monthlyCategories[categoryLabels[0]]
      ).map((cat) => ({
        label: cat,
        data: categoryLabels.map((month) => monthlyCategories[month][cat] || 0),
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`,
      }));

      const emotionLabels = Object.keys(monthlyEmotions);
      const emotionDatasets = Object.keys(
        monthlyEmotions[emotionLabels[0]]
      ).map((emo) => ({
        label: emo,
        data: emotionLabels.map((month) => monthlyEmotions[month][emo] || 0),
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`,
      }));

      setMonthlyCategoryData({
        labels: categoryLabels,
        datasets: categoryDatasets,
      });

      setMonthlyEmotionData({
        labels: emotionLabels,
        datasets: emotionDatasets,
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

  const handleExportToPDF = () => {
    const doc = new jsPDF();

    const weeklyUsageData = {
      title: "Uso Semanal de Usuarios",
      columns: ["Semana", "Cantidad de Usuarios"],
      rows: weeklyData.labels.map((week, index) => [
        week,
        weeklyData.datasets[0].data[index],
      ]),
    };

    const hourlyRangeUsageData = {
      title: "Uso de Usuarios por Rango de Horas",
      columns: ["Rango de Horas", "Cantidad de Usuarios"],
      rows: hourlyRangeData.labels.map((range, index) => [
        range,
        hourlyRangeData.datasets[0].data[index],
      ]),
    };

    // Datos del gráfico de categorías por mes
    const categoryUsageData = {
      title: "Categorías por Mes",
      columns: [
        "Mes",
        ...monthlyCategoryData.datasets.map((dataset) => dataset.label),
      ],
      rows: monthlyCategoryData.labels.map((month, rowIndex) => [
        month,
        ...monthlyCategoryData.datasets.map(
          (dataset) => dataset.data[rowIndex]
        ),
      ]),
    };

    // Datos del gráfico de emociones por mes
    const emotionUsageData = {
      title: "Emociones por Mes",
      columns: [
        "Mes",
        ...monthlyEmotionData.datasets.map((dataset) => dataset.label),
      ],
      rows: monthlyEmotionData.labels.map((month, rowIndex) => [
        month,
        ...monthlyEmotionData.datasets.map((dataset) => dataset.data[rowIndex]),
      ]),
    };

    const addTableToPDF = (title, columns, rows, startY) => {
      doc.text(title, 14, startY);
      doc.autoTable({
        startY: startY + 10,
        head: [columns],
        body: rows,
      });
      return doc.previousAutoTable.finalY + 10;
    };

    let currentY = 10;
    currentY = addTableToPDF(
      weeklyUsageData.title,
      weeklyUsageData.columns,
      weeklyUsageData.rows,
      currentY
    );
    currentY = addTableToPDF(
      hourlyRangeUsageData.title,
      hourlyRangeUsageData.columns,
      hourlyRangeUsageData.rows,
      currentY
    );
    currentY = addTableToPDF(
      categoryUsageData.title,
      categoryUsageData.columns,
      categoryUsageData.rows,
      currentY
    );
    currentY = addTableToPDF(
      emotionUsageData.title,
      emotionUsageData.columns,
      emotionUsageData.rows,
      currentY
    );

    doc.save("report.pdf");
  };

  const handleButtonClick = (chartType) => {
    setSelectedChart(chartType);
  };

  if (loading) return <p>Cargando datos...</p>;

  return (
    <Container>
      <div className="graphics-container">
        <div className="graphics-filter-buttons">
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("weeklyUsage")}
          >
            Uso Semanal
          </button>
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("hourlyRangeUsage")}
          >
            Uso por Rango de Horas
          </button>
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("categoryUsage")}
          >
            Categoría por Mes
          </button>
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("emotionUsage")}
          >
            Emociones por Mes
          </button>
          <div className="graphics-data">
            <button
              className="graphics-btn-function-a"
              onClick={handleExportToPDF}
            >
              Exportar a PDF
            </button>
            <button
              className="graphics-btn-function-b"
              onClick={() => window.alert("Exportar como Excel")}
            >
              Exportar Xls
            </button>
          </div>
        </div>

        <div className="graphics-chart-section">
          {selectedChart === "weeklyUsage" && weeklyData && (
            <div className="graphics-chart-item">
              <h2>Uso Semanal de Usuarios</h2>
              <Bar data={weeklyData} options={{ maintainAspectRatio: true }} />
              <p className="graphics-description">
                Este gráfico muestra el uso de la aplicación por semana.
              </p>
            </div>
          )}
          {selectedChart === "hourlyRangeUsage" && hourlyRangeData && (
            <div className="graphics-chart-item">
              <h2>Uso de Usuarios por Rango de Horas</h2>
              <Bar
                data={hourlyRangeData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Este gráfico muestra el uso de la aplicación por rangos de horas
                en un día.
              </p>
            </div>
          )}
          {selectedChart === "categoryUsage" && monthlyCategoryData && (
            <div className="graphics-chart-item">
              <h2>Categorías por Mes</h2>
              <Bar
                data={monthlyCategoryData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Muestra las categorías más utilizadas en la aplicación cada mes.
              </p>
            </div>
          )}
          {selectedChart === "emotionUsage" && monthlyEmotionData && (
            <div className="graphics-chart-item">
              <h2>Emociones por Mes</h2>
              <Bar
                data={monthlyEmotionData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Este gráfico refleja las emociones registradas cada mes.
              </p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Graphics;
