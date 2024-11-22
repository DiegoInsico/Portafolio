import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Para la navegación al detalle
import {
  getTickets,
  getAdminUsers,
  assignTicket,
} from "./ticketService";
import "./inbox.css";

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    const unsubscribe = getTickets(setTickets); // Escucha en tiempo real
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAdmins = async () => {
      const admins = await getAdminUsers();
      setAdminUsers(admins);
    };
    fetchAdmins();
  }, []);

  const handleAssign = async (ticketId, adminId) => {
    const admin = adminUsers.find((user) => user.id === adminId);
    if (admin) {
      await assignTicket(ticketId, admin.id, admin.displayName);
      alert("Ticket asignado exitosamente");
    }
  };

  const handleViewDetails = (ticketId) => {
    navigate(`/ticket/${ticketId}`); // Navegar al detalle del ticket
  };

  return (
    <div className="inbox-main-container">
      <h2>Tickets Pendientes</h2>
      <table className="inbox-ticket-table">
        <thead>
          <tr>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Asignar</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.subject}</td>
              <td>{ticket.status}</td>
              <td>
                {ticket.status === "pendiente" && (
                  <select
                    onChange={(e) => handleAssign(ticket.id, e.target.value)}
                  >
                    <option value="">Asignar a...</option>
                    {adminUsers.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.displayName}
                      </option>
                    ))}
                  </select>
                )}
              </td>
              <td>
                <button
                  className="inbox-view-btn"
                  onClick={() => handleViewDetails(ticket.id)}
                >
                  Ver Detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inbox;
