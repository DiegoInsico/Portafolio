import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { db } from "../../../firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const NivelSeguridad = () => {
  const [lineChartData, setLineChartData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate.seconds * 1000);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getZodiacSign = (birthDate) => {
    const birth = new Date(birthDate.seconds * 1000);
    const day = birth.getDate();
    const month = birth.getMonth() + 1;

    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Acuario";
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Piscis";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Tauro";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Géminis";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cáncer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitario";
    return "Capricornio";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entriesSnapshot = await getDocs(collection(db, "entradas"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        const users = {};
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          users[doc.id] = {
            comuna: data.comuna || null,
            city: data.city || null,
            country: data.country || "Indefinido",
            birthDate: data.birthDate || null,
          };
        });

        const lineDataTrends = {}; // Para el gráfico de líneas
        const allLevels = new Set(); // Para capturar todos los niveles existentes
        const aggregatedData = {}; // Para la tabla

        const processDate = (timestamp) => {
          const date = new Date(timestamp.seconds * 1000);
          return date.toLocaleDateString();
        };

        entriesSnapshot.forEach((doc) => {
          const data = doc.data();
          const userId = data.userId;

          if (userId && users[userId]) {
            const user = users[userId];
            const location = user.comuna || user.city || user.country;
            const level = data.nivel || "Sin Nivel";
            const date = processDate(data.fechaCreacion);

            allLevels.add(level); // Capturar niveles

            // Gráfico de líneas
            if (data.fechaCreacion) {
              const entryDate = new Date(data.fechaCreacion.seconds * 1000);
              if (entryDate >= startDate && entryDate <= endDate) {
                if (!lineDataTrends[date]) lineDataTrends[date] = {};
                if (!lineDataTrends[date][level]) lineDataTrends[date][level] = 0;
                lineDataTrends[date][level] += 1;

                // Tabla
                const locationKey = `${location}-${level}`;
                if (!aggregatedData[locationKey]) {
                  aggregatedData[locationKey] = {
                    nivel: level,
                    location,
                    entries: 0,
                    ages: [],
                    zodiacSigns: {},
                  };
                }
                aggregatedData[locationKey].entries += 1;

                if (user.birthDate) {
                  const age = calculateAge(user.birthDate);
                  aggregatedData[locationKey].ages.push(age);

                  const sign = getZodiacSign(user.birthDate);
                  if (!aggregatedData[locationKey].zodiacSigns[sign]) {
                    aggregatedData[locationKey].zodiacSigns[sign] = 0;
                  }
                  aggregatedData[locationKey].zodiacSigns[sign] += 1;
                }
              }
            }
          }
        });

        // Asegurar que todas las fechas tengan todos los niveles
        const allDates = Object.keys(lineDataTrends).sort(
          (a, b) => new Date(a) - new Date(b)
        );
        allDates.forEach((date) => {
          allLevels.forEach((level) => {
            if (!lineDataTrends[date][level]) {
              lineDataTrends[date][level] = 0;
            }
          });
        });

        const tableData = Object.values(aggregatedData).map((data) => {
          const averageAge =
            data.ages.length > 0
              ? Math.round(data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length)
              : "N/A";
          const mostCommonSign =
            Object.keys(data.zodiacSigns).reduce((a, b) =>
              data.zodiacSigns[a] > data.zodiacSigns[b] ? a : b
            ) || "N/A";

          return {
            nivel: data.nivel,
            location: data.location,
            entries: data.entries,
            averageAge,
            mostCommonSign,
          };
        });

        const lineData = {
          labels: allDates,
          datasets: Array.from(allLevels).map((level, index) => ({
            label: `Nivel ${level}`,
            data: allDates.map((date) => lineDataTrends[date][level] || 0),
            borderColor: `rgba(${index * 50}, ${150 - index * 30}, 200, 1)`,
            fill: false,
          })),
        };

        setTableData(tableData);
        setLineChartData(lineData);
      } catch (error) {
        console.error("Error al procesar los datos:", error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tendencia de Creación de Entradas</h2>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <label>Fecha de Inicio:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
        />
        <label style={{ marginLeft: "10px" }}>Fecha de Fin:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
        />
      </div>
      {lineChartData ? (
        <Line
          data={lineChartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
            },
            scales: {
              x: { title: { display: true, text: "Fecha" } },
              y: { title: { display: true, text: "Cantidad" }, beginAtZero: true },
            },
          }}
        />
      ) : (
        <p>Cargando datos...</p>
      )}

      <h2>Detalle de Entradas</h2>
      <table
        style={{
          width: "100%",
          border: "1px solid #ccc",
          textAlign: "left",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Nivel</th>
            <th>Ubicación</th>
            <th>Cantidad Entradas</th>
            <th>Promedio Edad</th>
            <th>Promedio Signo</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.nivel}</td>
              <td>{entry.location}</td>
              <td>{entry.entries}</td>
              <td>{entry.averageAge}</td>
              <td>{entry.mostCommonSign}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NivelSeguridad;
