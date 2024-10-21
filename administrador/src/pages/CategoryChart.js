// src/components/CategoryChart.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, Title } from "chart.js"; // Importar elementos

// Registrar los elementos necesarios
Chart.register(ArcElement, Tooltip, Legend, Title);

const CategoryChart = () => {
  const [categoryData, setCategoryData] = useState(null); // Inicialmente null

  useEffect(() => {
    const fetchCategoryData = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const categoryCount = {};

      entriesSnapshot.docs.forEach((doc) => {
        const category = doc.data().categoria || "Sin Categoría"; // Agrega una categoría por defecto
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      // Actualizamos el estado cuando los datos están listos
      setCategoryData({
        labels: Object.keys(categoryCount),
        datasets: [
          {
            data: Object.values(categoryCount),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
            hoverBackgroundColor: ["#FF4C72", "#309CE4", "#FFC745", "#3ABFBF", "#8856FF"],
          },
        ],
      });
    };

    fetchCategoryData();
  }, []);

  return (
    <div>
      {categoryData ? (
        <Pie data={categoryData} />
      ) : (
        <p>Cargando datos del gráfico...</p>  // Mensaje mientras los datos se cargan
      )}
    </div>
  );
};

export default CategoryChart;
