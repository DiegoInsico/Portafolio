import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Bar, Pie, Scatter } from "react-chartjs-2";
import "chart.js/auto";
import './css/resumen.css'

const RelationCharts = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch data from all collections
        const [usersSnapshot, testigosSnapshot, beneficiariosSnapshot,] =
          await Promise.all([
            getDocs(collection(db, "users")),
            getDocs(collection(db, "testigos")),
            getDocs(collection(db, "beneficiarios")),
            getDocs(collection(db, "documentos")),
          ]);

        const usersData = {};
        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const userId = doc.id;
          const age =
            userData.birthDate && userData.birthDate.seconds
              ? new Date().getFullYear() -
                new Date(userData.birthDate.seconds * 1000).getFullYear()
              : "No disponible";

          usersData[userId] = {
            age,
            testigos: 0,
            beneficiarios: 0,
            documentos: 0,
          };
        });

        // Count testigos
        testigosSnapshot.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || "No disponible";
          if (usersData[userId]) {
            usersData[userId].testigos += 1;
          }
        });

        // Count beneficiarios
        beneficiariosSnapshot.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || "No disponible";
          if (usersData[userId]) {
            usersData[userId].beneficiarios += 1;
          }
        });

        setData(Object.values(usersData));
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }

    fetchData();
  }, []);

  if (!data) return <p>Cargando datos...</p>;


  // Prepare Scatter Chart Data
  const scatterChartData = {
    datasets: [
      {
        label: "Edad vs Testigos",
        data: data
          .filter((user) => user.age !== "No disponible")
          .map((user) => ({
            x: user.age,
            y: user.testigos,
          })),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="dataser-container">

      <div className="dataser-section">
        <h3 className="dataser-chart-title">Relación entre Edad y Testigos</h3>
        <Scatter
          data={scatterChartData}
          options={{
            scales: {
              x: { title: { display: true, text: "Edad" } },
              y: { title: { display: true, text: "Cantidad de Testigos" } },
            },
          }}
        />
      </div>
    </div>
  );
  
  
  
};

export default RelationCharts;
