import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";

import "./css/context.css"; // Archivo CSS con los estilos necesarios
import { db } from "../../../firebase";
import { Line } from "react-chartjs-2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserContext = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [summary, setSummary] = useState({ weeklySummary: {}, monthlySummary: {} });

  // Fechas iniciales (últimos 7 días por defecto)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Últimos 7 días por defecto
    return date;
  });
  const [endDate, setEndDate] = useState(new Date()); // Fecha de hoy por defecto
  
  const validateDateRange = () => {
  if (startDate > endDate) {
    console.error("La fecha de inicio debe ser menor o igual a la fecha de fin.");
    return false;
  }
  return true;
};

  // Función para cargar los datos
  const fetchData = async () => {
    if (!validateDateRange()) return;

    try {
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));
      const entriesSnapshot = await getDocs(collection(db, "entradas"));

      const dailyActivity = {};
      const weeklySummary = {};
      const monthlySummary = {};

      const processDate = (timestamp) => {
        const date = new Date(timestamp.seconds * 1000);
        const day = date.toLocaleDateString();
        const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
        const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
        return { day, week, month };
      };

      sessionsSnapshot.forEach((doc) => {
        const { timestamp } = doc.data();
        if (!timestamp) return;

        const date = new Date(timestamp.seconds * 1000);
        if (date >= startDate && date <= endDate) {
          const { day, week, month } = processDate(timestamp);

          dailyActivity[day] = dailyActivity[day] || { sessions: 0, entries: 0 };
          dailyActivity[day].sessions += 1;

          weeklySummary[week] = weeklySummary[week] || { sessions: 0, entries: 0 };
          weeklySummary[week].sessions += 1;

          monthlySummary[month] = monthlySummary[month] || { sessions: 0, entries: 0 };
          monthlySummary[month].sessions += 1;
        }
      });

      entriesSnapshot.forEach((doc) => {
        const { fechaCreacion } = doc.data();
        if (!fechaCreacion) return;

        const date = new Date(fechaCreacion.seconds * 1000);
        if (date >= startDate && date <= endDate) {
          const { day, week, month } = processDate(fechaCreacion);

          dailyActivity[day] = dailyActivity[day] || { sessions: 0, entries: 0 };
          dailyActivity[day].entries += 1;

          weeklySummary[week] = weeklySummary[week] || { sessions: 0, entries: 0 };
          weeklySummary[week].entries += 1;

          monthlySummary[month] = monthlySummary[month] || { sessions: 0, entries: 0 };
          monthlySummary[month].entries += 1;
        }
      });

      const sortedDays = Object.keys(dailyActivity).sort((a, b) => new Date(a) - new Date(b));
      const sessionsData = sortedDays.map((day) => dailyActivity[day].sessions);
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
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Cargar datos automáticamente
  useEffect(() => {
    const fetchData = async () => {
      if (!validateDateRange()) return;
      if (startDate > endDate) {
        console.error("Fecha de inicio debe ser menor o igual a la fecha de fin.");
        return;
      }

      try {
        const sessionsSnapshot = await getDocs(collection(db, "sessions"));
        const entriesSnapshot = await getDocs(collection(db, "entradas"));

        const dailyActivity = {};
        const weeklySummary = {};
        const monthlySummary = {};

        const processDate = (timestamp) => {
          const date = new Date(timestamp.seconds * 1000);
          const day = date.toLocaleDateString();
          const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
          const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
          return { day, week, month };
        };

        sessionsSnapshot.forEach((doc) => {
          const { timestamp } = doc.data();
          if (!timestamp) return;

          const date = new Date(timestamp.seconds * 1000);
          if (date >= startDate && date <= endDate) {
            const { day, week, month } = processDate(timestamp);

            dailyActivity[day] = dailyActivity[day] || { sessions: 0, entries: 0 };
            dailyActivity[day].sessions += 1;

            weeklySummary[week] = weeklySummary[week] || { sessions: 0, entries: 0 };
            weeklySummary[week].sessions += 1;

            monthlySummary[month] = monthlySummary[month] || { sessions: 0, entries: 0 };
            monthlySummary[month].sessions += 1;
          }
        });

        entriesSnapshot.forEach((doc) => {
          const { fechaCreacion } = doc.data();
          if (!fechaCreacion) return;

          const date = new Date(fechaCreacion.seconds * 1000);
          if (date >= startDate && date <= endDate) {
            const { day, week, month } = processDate(fechaCreacion);

            dailyActivity[day] = dailyActivity[day] || { sessions: 0, entries: 0 };
            dailyActivity[day].entries += 1;

            weeklySummary[week] = weeklySummary[week] || { sessions: 0, entries: 0 };
            weeklySummary[week].entries += 1;

            monthlySummary[month] = monthlySummary[month] || { sessions: 0, entries: 0 };
            monthlySummary[month].entries += 1;
          }
        });

        const sortedDays = Object.keys(dailyActivity).sort((a, b) => new Date(a) - new Date(b));
        const sessionsData = sortedDays.map((day) => dailyActivity[day].sessions);
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
    <div className="context-container">
      <div className="context-content">
        {/* Filtro de Fechas */}
        <div className="context-date-picker-container">
          <div className="context-date-picker">
            <div className="context-date-picker-item">
              <label className="context-date-label">Fecha de Inicio:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                className="context-date-input"
              />
            </div>
            <div className="context-date-picker-item">
              <label className="context-date-label">Fecha de Fin:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate} // Validación para evitar fechas inconsistentes
                dateFormat="dd/MM/yyyy"
                className="context-date-input"
              />
            </div>
          </div>
        </div>
  
        {/* Contenedor del gráfico y la tabla */}
        <div className="context-visualization">
          <div className="context-chart">
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
          </div>
          <div className="context-table">
            <h2>Resumen Semanal</h2>
            <table>
              <thead>
                <tr>
                  <th>Semana</th>
                  <th>Sesiones</th>
                  <th>Entradas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.weeklySummary || {}).map(([week, counts]) => (
                  <tr key={week}>
                    <td>{week}</td>
                    <td>{counts.sessions}</td>
                    <td>{counts.entries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>Resumen Mensual</h2>
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Sesiones</th>
                  <th>Entradas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary.monthlySummary || {}).map(([month, counts]) => (
                  <tr key={month}>
                    <td>{month}</td>
                    <td>{counts.sessions}</td>
                    <td>{counts.entries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default UserContext;
