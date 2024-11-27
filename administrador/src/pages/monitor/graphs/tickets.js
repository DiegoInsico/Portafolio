import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // Ajusta la ruta según tu proyecto
import './css/ticket.css'
const mapUserIdsToDisplayNames = async () => {
  const userMap = {};

  try {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;
      const displayName = data.displayName || "Usuario Desconocido";
      userMap[userId] = displayName;
    });

    return userMap;
  } catch (error) {
    console.error("Error al mapear userId a displayName:", error);
    return userMap;
  }
};

const TicketsChart = () => {
  const [statusData, setStatusData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const userMap = await mapUserIdsToDisplayNames();

        const ticketsCollection = collection(db, "tickets");
        const ticketsSnapshot = await getDocs(ticketsCollection);

        let abiertoCount = 0;
        let cerradoCount = 0;
        const tableRows = [];

        ticketsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === "abierto") {
            abiertoCount++;
          } else if (data.status === "cerrado") {
            cerradoCount++;
          }

          if (data.status === "abierto") {
            tableRows.push({
              id: doc.id,
              assignedTo: userMap[data.assignedTo] || "Usuario Desconocido",
              priority: data.priority || "No Definida",
              createdAt:
                data.createdAt?.toDate().toLocaleString() || "Fecha Desconocida",
            });
          }
        });

        // Calcular porcentajes después de contar
        const total = abiertoCount + cerradoCount;
        const statusData = [
          {
            estado: "abierto",
            porcentaje: total > 0 ? ((abiertoCount / total) * 100).toFixed(2) : 0,
          },
          {
            estado: "cerrado",
            porcentaje: total > 0 ? ((cerradoCount / total) * 100).toFixed(2) : 0,
          },
        ];

        setStatusData(statusData);
        setTableData(tableRows);
      } catch (error) {
        console.error("Error al obtener los tickets: ", error);
      }
    }

    fetchTickets();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/tickets/${id}`); // Redirige a la página de detalles del ticket
  };

  return (
    <div className="ticket-container">
      <h2 className="ticket-title">Porcentaje de Tickets por Estado</h2>
      <div className="ticket-charts">
        {statusData.map((item, index) => (
          <div key={index} className="ticket-chart-item">
            <CircularProgressbar
              value={item.porcentaje}
              text={`${item.porcentaje}%`}
              styles={buildStyles({
                textColor: "#000",
                pathColor:
                  item.estado === "cerrado"
                    ? "#4CAF50"
                    : item.estado === "abierto"
                    ? "#FFC107"
                    : "#F44336",
                trailColor: "#d6d6d6",
              })}
            />
            <p className="ticket-chart-label">{item.estado}</p>
          </div>
        ))}
      </div>
  
      <h2 className="ticket-subtitle">Tickets Abiertos</h2>
      <div className="ticket-table-container">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Asignado A</th>
              <th>Prioridad</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.assignedTo}</td>
                <td>{row.priority}</td>
                <td>{row.createdAt}</td>
                <td>
                  <button
                    className="ticket-details-button"
                    onClick={() => handleViewDetails(row.id)}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};

export default TicketsChart;
