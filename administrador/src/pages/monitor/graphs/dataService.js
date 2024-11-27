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
        const [usersSnapshot, testigosSnapshot, beneficiariosSnapshot, documentosSnapshot] =
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

        // Count documentos
        documentosSnapshot.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId || "No disponible";
          if (usersData[userId]) {
            usersData[userId].documentos += 1;
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

  // Prepare Bar Chart Data
  const barChartData = {
    labels: data.map((user, index) => `Usuario ${index + 1}`),
    datasets: [
      {
        label: "Documentos por Usuario",
        data: data.map((user) => user.documentos),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare Pie Chart Data
  const pieChartData = {
    labels: ["Sin Documentos", "Con Documentos"],
    datasets: [
      {
        data: [
          data.filter((user) => user.documentos === 0).length,
          data.filter((user) => user.documentos > 0).length,
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

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
    <div className="resume-container">
      <div className="resume-section">
        <h3 className="resume-chart-title">Documentos por Usuario</h3>
        <Bar data={barChartData} />
      </div>
      <div className="resume-section">
        <h3 className="resume-chart-title">Distribución de Documentos</h3>
        <Pie data={pieChartData} />
      </div>
      <div className="resume-section">
        <h3 className="resume-chart-title">Relación entre Edad y Testigos</h3>
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
