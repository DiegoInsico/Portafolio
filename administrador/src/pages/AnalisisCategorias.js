// src/pages/AnalisisCategorias.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./AnalisisCategorias.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const AnalisisCategorias = () => {
  const [categoryData, setCategoryData] = useState({});

  useEffect(() => {
    const fetchEntries = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const entriesList = entriesSnapshot.docs.map((doc) => doc.data());

      // Contar las categorías
      const categoryCount = {};
      entriesList.forEach((entry) => {
        const category = entry.categoria || "Sin categoría";
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            label: "Entradas por Categoría",
            data: Object.values(categoryCount),
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
    };

    fetchEntries();
  }, []);

  return (
    <div className="analisis-categorias-container">
      <h2>Análisis de Categorías</h2>
      <div className="chart-container">
        {categoryData.labels ? (
          <Pie data={categoryData} />
        ) : (
          <p>Cargando datos de categorías...</p>
        )}
      </div>
    </div>
  );
};

export default AnalisisCategorias;
