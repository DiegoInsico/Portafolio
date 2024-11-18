import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Line, Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./graphs.css";
import Container from "../../components/container";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const Graphics = () => {
  const [selectedChart, setSelectedChart] = useState("weeklyUsage");
  const [monthlyCategoryData, setMonthlyCategoryData] = useState(null);
  const [monthlyEmotionData, setMonthlyEmotionData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [hourlyRangeData, setHourlyRangeData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [premiumUserData, setPremiumUserData] = useState(null);
  const [vaultUsageData, setVaultUsageData] = useState(null);
  const [userCountryData, setUserCountryData] = useState(null);

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
      let premiumCount = 0;
      let nonPremiumCount = 0;
      let vaultLevel2Count = 0;
      let vaultLevel3Count = 0;
      const countryCount = {};

      const entradasSnapshot = await getDocs(
        query(collection(db, "entradas"), orderBy("fechaCreacion"))
      );

      entradasSnapshot.forEach((doc) => {
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

      const usersSnapshot = await getDocs(query(collection(db, "users")));

      usersSnapshot.forEach((doc) => {
        const data = doc.data();

        // Contar usuarios premium y no premium
        if (data.isPremium) {
          premiumCount++;
        } else {
          nonPremiumCount++;
        }

        // Contar uso de baúles nivel 2 y nivel 3
        if (data.level2Password) vaultLevel2Count++;
        if (data.level3Password) vaultLevel3Count++;

        // Contar usuarios por país
        const countryCode = data.countryCode;
        if (countryCode) {
          countryCount[countryCode] = (countryCount[countryCode] || 0) + 1;
        }
      });

      // Configuración de datos para gráficos
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

      setPremiumUserData({
        labels: ["Usuarios Premium", "Usuarios No Premium"],
        datasets: [
          {
            label: "Distribución de Usuarios Premium",
            data: [premiumCount, nonPremiumCount],
            backgroundColor: ["#4caf50", "#f44336"],
          },
        ],
      });

      setVaultUsageData({
        labels: ["Nivel 2", "Nivel 3"],
        datasets: [
          {
            label: "Uso de Baúles",
            data: [vaultLevel2Count, vaultLevel3Count],
            backgroundColor: ["#2196f3", "#ff9800"],
          },
        ],
      });

      const countryLabels = Object.keys(countryCount).map((code) =>
        code === "+56" ? "Chile" : code === "+1" ? "EE.UU." : code
      );
      const countryData = Object.values(countryCount);

      setUserCountryData({
        labels: countryLabels,
        datasets: [
          {
            label: "Usuarios por País",
            data: countryData,
            backgroundColor: ["#3f51b5", "#ff5722", "#8bc34a"],
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

  // Función para exportar todos los gráficos a PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    
    const addChartToPDF = (title, chartData) => {
      const columns = ["Etiqueta", "Valor"];
      const rows = chartData.labels.map((label, index) => [
        label,
        chartData.datasets[0].data[index],
      ]);
      doc.text(title, 14, doc.previousAutoTable.finalY || 10);
      doc.autoTable({
        startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 20,
        head: [columns],
        body: rows,
      });
    };

    addChartToPDF("Uso Semanal de Usuarios", weeklyData);
    addChartToPDF("Uso por Rango de Horas", hourlyRangeData);
    addChartToPDF("Categoría por Mes", monthlyCategoryData);
    addChartToPDF("Emociones por Mes", monthlyEmotionData);
    addChartToPDF("Distribución de Usuarios Premium", premiumUserData);
    addChartToPDF("Uso de Baúles", vaultUsageData);
    addChartToPDF("Usuarios por País", userCountryData);

    doc.save("Reportes_Graficos.pdf");
  };

  // Función para exportar todos los gráficos a Excel
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const addSheet = (sheetName, data) => {
      const rows = data.labels.map((label, index) => ({
        Label: label,
        Value: data.datasets[0].data[index],
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };

    if (weeklyData) addSheet("Uso Semanal", weeklyData);
    if (hourlyRangeData) addSheet("Rango Horas", hourlyRangeData);
    if (monthlyCategoryData) addSheet("Categorias por Mes", monthlyCategoryData);
    if (monthlyEmotionData) addSheet("Emociones por Mes", monthlyEmotionData);
    if (premiumUserData) addSheet("Usuarios Premium", premiumUserData);
    if (vaultUsageData) addSheet("Uso de Baúles", vaultUsageData);
    if (userCountryData) addSheet("Usuarios por País", userCountryData);

    XLSX.writeFile(workbook, "Reportes_Graficos_Improved_Formatted.xlsx");
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
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("premiumUsers")}
          >
            Usuarios Premium
          </button>
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("vaultUsage")}
          >
            Uso de Baúles
          </button>
          <button
            className="graphics-btn-filter"
            onClick={() => handleButtonClick("userCountry")}
          >
            Usuarios por País
          </button>
          <div className="graphics-data">
            <button
              className="graphics-btn-function-a"
              onClick={handleExportToPDF}
            >
              Exportar a PDF
            </button>
            <button className="graphics-btn-function-b" onClick={exportToExcel}>
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
          {selectedChart === "premiumUsers" && premiumUserData && (
            <div className="graphics-chart-item">
              <h2>Distribución de Usuarios Premium</h2>
              <Pie
                data={premiumUserData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Este gráfico muestra la proporción de usuarios premium y no
                premium.
              </p>
            </div>
          )}

          {selectedChart === "vaultUsage" && vaultUsageData && (
            <div className="graphics-chart-item">
              <h2>Uso de Baúles</h2>
              <Bar
                data={vaultUsageData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Este gráfico muestra cuántos usuarios están usando los baúles de
                nivel 2 y 3.
              </p>
            </div>
          )}

          {selectedChart === "userCountry" && userCountryData && (
            <div className="graphics-chart-item">
              <h2>Usuarios por País</h2>
              <Pie
                data={userCountryData}
                options={{ maintainAspectRatio: true }}
              />
              <p className="graphics-description">
                Este gráfico muestra la distribución de usuarios por país.
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
