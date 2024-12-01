import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../../../firebase"; // Ajusta la ruta según tu proyecto
import './css/ticket.css';

const mapEmployeeIdsToDisplayNames = async () => {
  const employeeMap = {};

  try {
    const employeesCollection = collection(db, "employees");
    const employeesSnapshot = await getDocs(employeesCollection);

    employeesSnapshot.forEach((doc) => {
      const data = doc.data();
      const employeeIdentifier = doc.id; // Usa el ID del documento como clave
      const displayName = data.displayName || "Empleado Desconocido";
      const role = data.role || "Desconocido";

      console.log(
        `Empleado encontrado: ${displayName}, ID: ${employeeIdentifier}`
      );

      // Almacena el empleado en el mapa
      employeeMap[employeeIdentifier] = { displayName, role };
    });

    console.log("Mapa de empleados actualizado:", employeeMap);
    return employeeMap;
  } catch (error) {
    console.error("Error al mapear employeeId a displayName:", error);
    return employeeMap;
  }
};

const TicketsChart = () => {
  const [statusData, setStatusData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      try {
        const employeeMap = await mapEmployeeIdsToDisplayNames();

        const ticketsCollection = collection(db, "tickets");
        const ticketsSnapshot = await getDocs(ticketsCollection);

        let abiertoCount = 0;
        let cerradoCount = 0;
        const tableRows = [];

        ticketsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`Ticket encontrado: ${doc.id}`, data);

          if (data.status === "abierto") {
            abiertoCount++;
          } else if (data.status === "cerrado") {
            cerradoCount++;
          }

          const assignedToInfo = employeeMap[data.assignedTo] || {
            displayName: "Empleado Desconocido",
            role: "Desconocido",
          };

          if (data.status === "abierto") {
            tableRows.push({
              id: doc.id,
              assignedTo: `${assignedToInfo.displayName} - ${assignedToInfo.role}`,
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

        console.log("Tickets procesados:", tableRows);
        console.log("Datos de estado:", statusData);
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

      <div className="ticket-table-container">
        <h2 className="ticket-title">Porcentaje de Tickets por Estado</h2>
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Empleado Asignado</th>
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
