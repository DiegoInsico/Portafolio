import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según tu estructura
import "chart.js/auto";
import DatePicker from "react-datepicker"; // Asegúrate de instalar react-datepicker
import "react-datepicker/dist/react-datepicker.css";

const SesionesChart = () => {
  const [sessionData, setSessionData] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    async function fetchSessions() {
      const sessionsCollection = collection(db, "sessions");

      // Aplicar filtro por rango de fechas
      const q = query(
        sessionsCollection,
        where("timestamp", ">=", startDate.toISOString()),
        where("timestamp", "<=", endDate.toISOString())
      );
      const snapshot = await getDocs(q);

      const dateCounts = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const sessionDate = new Date(data.timestamp).toLocaleDateString();

        if (!dateCounts[sessionDate]) {
          dateCounts[sessionDate] = 0;
        }
        dateCounts[sessionDate] += 1;
      });

      // Preparar datos para el gráfico
      const sortedDates = Object.keys(dateCounts).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const sortedCounts = sortedDates.map((date) => dateCounts[date]);

      setSessionData({
        labels: sortedDates,
        datasets: [
          {
            label: "Sesiones por Día",
            data: sortedCounts,
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.5)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    }

    fetchSessions();
  }, [startDate, endDate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Comportamiento de Sesiones</h2>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <label>Fecha Inicio:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div>
          <label>Fecha Fin:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>
      {sessionData ? (
        <Line
          data={sessionData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              tooltip: { enabled: true },
            },
            scales: {
              x: { title: { display: true, text: "Fecha" } },
              y: {
                title: { display: true, text: "Cantidad de Sesiones" },
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
};

export default SesionesChart;
