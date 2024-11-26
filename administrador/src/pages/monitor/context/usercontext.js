import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import "./../graphics.css"; // Opcional: estilos adicionales
import { db } from "../../../firebase";
import { Line } from "react-chartjs-2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";

const UserContext = () => {
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(addDays(new Date(), 7));


 useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch collections
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));
      const entriesSnapshot = await getDocs(collection(db, "entradas"));

      // Prepare data
      const dailyActivity = {};
      const weeklySummary = {};
      const monthlySummary = {};

      const processDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        const day = date.toLocaleDateString();
        const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
        return { day, week, month };
      };

      // Filter and count sessions
      sessionsSnapshot.forEach((doc) => {
        const { timestamp } = doc.data();
        if (!timestamp) return;
        const date = new Date(timestamp.seconds * 1000);

        // Apply date range filter
        if (date >= startDate && date <= endDate) {
          const { day, week, month } = processDate(timestamp);

          if (!dailyActivity[day])
            dailyActivity[day] = { sessions: 0, entries: 0 };
          dailyActivity[day].sessions += 1;

          if (!weeklySummary[week])
            weeklySummary[week] = { sessions: 0, entries: 0 };
          weeklySummary[week].sessions += 1;

          if (!monthlySummary[month])
            monthlySummary[month] = { sessions: 0, entries: 0 };
          monthlySummary[month].sessions += 1;
        }
      });

      // Filter and count entries
      entriesSnapshot.forEach((doc) => {
        const { fechaCreacion } = doc.data();
        if (!fechaCreacion) return;
        const date = new Date(fechaCreacion.seconds * 1000);

        // Apply date range filter
        if (date >= startDate && date <= endDate) {
          const { day, week, month } = processDate(fechaCreacion);

          if (!dailyActivity[day])
            dailyActivity[day] = { sessions: 0, entries: 0 };
          dailyActivity[day].entries += 1;

          if (!weeklySummary[week])
            weeklySummary[week] = { sessions: 0, entries: 0 };
          weeklySummary[week].entries += 1;

          if (!monthlySummary[month])
            monthlySummary[month] = { sessions: 0, entries: 0 };
          monthlySummary[month].entries += 1;
        }
      });

      // Prepare data for chart
      const sortedDays = Object.keys(dailyActivity).sort(
        (a, b) => new Date(a) - new Date(b)
      );
      const sessionsData = sortedDays.map(
        (day) => dailyActivity[day].sessions
      );
      const entriesData = sortedDays.map((day) => dailyActivity[day].entries);

      setChartData({
        labels: sortedDays,
        datasets: [
          {
            label: "Sesiones",
            data: sessionsData,
            borderColor: "#36A2EB",
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Entradas",
            data: entriesData,
            borderColor: "#FF6384",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            fill: true,
            tension: 0.4,
          },
        ],
      });

      setSummary({ weeklySummary, monthlySummary });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, [startDate, endDate]);

  return (
    <div className="graphics-container">
      <div style={{ padding: "20px" }}>
        <h2>Comportamiento Diario de Usuarios</h2>
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                tooltip: { enabled: true },
              },
              scales: {
                x: { title: { display: true, text: "Fecha" } },
                y: {
                  title: { display: true, text: "Cantidad" },
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <p>Cargando datos...</p>
        )}

        <h2>Resumen Semanal</h2>
        <ul>
          {Object.entries(summary.weeklySummary || {}).map(([week, counts]) => (
            <li key={week}>
              {week}: {counts.sessions} sesiones, {counts.entries} entradas
            </li>
          ))}
        </ul>
        <h2>Resumen Mensual</h2>
        <ul>
          {Object.entries(summary.monthlySummary || {}).map(
            ([month, counts]) => (
              <li key={month}>
                {month}: {counts.sessions} sesiones, {counts.entries} entradas
              </li>
            )
          )}
        </ul>
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <h2>Selecciona el Rango de Fechas</h2>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <div>
              <label>Fecha de Inicio:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <label>Fecha de Fin:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserContext;
