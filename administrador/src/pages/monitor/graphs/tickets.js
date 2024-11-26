import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta la ruta según tu proyecto

const TicketsChart = () => {
  const [statusData, setStatusData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    async function fetchTickets() {
      const solicitudesCollection = collection(db, "solicitudes");
      const snapshot = await getDocs(solicitudesCollection);

      const statusCounts = {};
      const tableRows = [];
      let total = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        total += 1;

        // Contar por estado (respondido, en espera, etc.)
        const estado = data.estado || "Sin Estado";
        if (!statusCounts[estado]) statusCounts[estado] = 0;
        statusCounts[estado] += 1;

        // Crear datos para la tabla
        tableRows.push({
          messageId: data.messageId,
          estado,
          motivo: data.motivo || "Sin Motivo",
          description: data.description || "Sin Descripción",
          respondido: estado === "respondido" ? "Sí" : "No",
        });
      });

      // Convertir datos de estado a porcentaje
      const statusData = Object.keys(statusCounts).map((estado) => ({
        estado,
        porcentaje: ((statusCounts[estado] / total) * 100).toFixed(1),
        cantidad: statusCounts[estado],
      }));

      setStatusData(statusData);
      setTableData(tableRows);
      setTotalTickets(total);
    }

    fetchTickets();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Solicitudes por Estado (Porcentaje)</h2>
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        {statusData.map((item, index) => (
          <div key={index} style={{ width: "120px", textAlign: "center" }}>
            <CircularProgressbar
              value={item.porcentaje}
              text={`${item.porcentaje}%`}
              styles={buildStyles({
                textColor: "#000",
                pathColor:
                  item.estado === "respondido"
                    ? "#4CAF50"
                    : item.estado === "en espera"
                    ? "#FFC107"
                    : "#F44336",
                trailColor: "#d6d6d6",
              })}
            />
            <p style={{ marginTop: "10px" }}>{item.estado}</p>
          </div>
        ))}
      </div>

      <h2>Detalle de Solicitudes</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Mensaje ID</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Descripción</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Estado</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Motivo</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Respondido</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.messageId}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.description}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.estado}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.motivo}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{row.respondido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsChart;
