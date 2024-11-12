import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Line, Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./graphs.css";
import Container from "../../components/container";

const Graphics = () => {
  const [monthlyCategoryData, setMonthlyCategoryData] = useState(null);
  const [monthlyEmotionData, setMonthlyEmotionData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsageData = async () => {
    try {
      const monthlyCategories = {};
      const monthlyEmotions = {};
      const usageData = [];
      const dailyUsage = {};
      const q = query(collection(db, "entradas"), orderBy("fechaCreacion"));
      const snapshot = await getDocs(q);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const fechaCreacion = data.fechaCreacion.toDate();
        const hora = fechaCreacion.getHours();
        const dia = fechaCreacion.toLocaleDateString();
        const categoria = data.categoria || "Sin categoría";
        const emociones = data.emociones || [];
        const month = fechaCreacion.toLocaleDateString("default", { month: "long", year: "numeric" });

        if (!monthlyCategories[month]) monthlyCategories[month] = {};
        monthlyCategories[month][categoria] = (monthlyCategories[month][categoria] || 0) + 1;

        emociones.forEach((emotion) => {
          if (!monthlyEmotions[month]) monthlyEmotions[month] = {};
          monthlyEmotions[month][emotion] = (monthlyEmotions[month][emotion] || 0) + 1;
        });

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

      const categoryLabels = Object.keys(monthlyCategories);
      const categoryDatasets = Object.keys(monthlyCategories[categoryLabels[0]]).map((cat) => ({
        label: cat,
        data: categoryLabels.map((month) => monthlyCategories[month][cat] || 0),
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }));

      const emotionLabels = Object.keys(monthlyEmotions);
      const emotionDatasets = Object.keys(monthlyEmotions[emotionLabels[0]]).map((emo) => ({
        label: emo,
        data: emotionLabels.map((month) => monthlyEmotions[month][emo] || 0),
        backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      }));

      setChartData({
        labels: [...Array(24).keys()],
        datasets: [
          {
            label: "Uso de usuarios por hora",
            data: usagePerHour,
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

  if (loading) return <p>Cargando datos...</p>;

  return (
    <Container>
      <div className="graphics-container">
        <div className="filter-buttons">
          <button className="btn-filter">Mostrar Categorías</button>
          <button className="btn-filter">Mostrar Emociones</button>
          <button className="btn-filter">Mostrar Uso por Hora</button>
          <button className="btn-filter">Mostrar Uso Diario</button>
        </div>

        <div className="chart-section">
          <div className="chart-item">
            <h2>Uso de Usuarios por Hora</h2>
            <Line data={chartData} options={{ maintainAspectRatio: true }} />
          </div>
          <div className="chart-item">
            <h2>Uso Diario de Usuarios</h2>
            <Line data={dailyData} options={{ maintainAspectRatio: true }} />
          </div>
          <div className="chart-item">
            <h2>Categorías por Mes</h2>
            <Bar data={monthlyCategoryData} options={{ maintainAspectRatio: true }} />
          </div>
          <div className="chart-item">
            <h2>Emociones por Mes</h2>
            <Bar data={monthlyEmotionData} options={{ maintainAspectRatio: true }} />
          </div>
        </div>

        <div className="description-section">
          <p>Descripción: Frecuencia de uso de la aplicación por hora.</p>
          <p>Descripción: Actividad diaria de los usuarios en el sistema.</p>
          <p>Descripción: Categorías más utilizadas cada mes.</p>
          <p>Descripción: Emociones más registradas cada mes.</p>
        </div>
      </div>
    </Container>
  );
};

export default Graphics;
