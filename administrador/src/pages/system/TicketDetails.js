import React, { useState, useEffect } from "react";
import { getTickets, saveMessage, updateTicketStatus } from "./ticketService";
import { useParams } from "react-router-dom";
import "./TicketDetails.css";

const TicketDetails = () => {
  const { ticketId } = useParams(); // Extraer el ID del ticket
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubscribe = getTickets((tickets) => {
      const currentTicket = tickets.find((t) => t.id === ticketId);
      setTicket(currentTicket);
      console.log("Datos del Ticket:", currentTicket);
    });
    return () => unsubscribe();
  }, [ticketId]);
  

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    const updatedMessages = [
      ...(ticket.messages || []),
      { content: message, sender: "admin", timestamp: new Date() },
    ];
    await saveMessage(ticket.id, updatedMessages);
    setMessage("");
  };

  const handleMarkAsSolved = async () => {
    await updateTicketStatus(ticket.id, "resuelto");
    alert("Ticket marcado como resuelto");
  };

  if (!ticket) return <p>Cargando ticket...</p>;

  return (
    <div className="ticket-details-container">
      <h2>Detalles del Ticket</h2>
      <p><strong>Asunto:</strong> {ticket.subject}</p>
      <p><strong>Estado:</strong> {ticket.status}</p>
      <p>
        <strong>Asignado a:</strong> {ticket.assignedTo?.adminName || "Sin asignar"}
      </p>
      <div className="ticket-messages">
        <h3>Mensajes</h3>
        <div className="messages-list">
          {ticket.messages?.map((msg, index) => (
            <div key={index} className="message-item">
              <p><strong>{msg.sender}:</strong> {msg.content}</p>
              <p className="message-timestamp">{new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleSendMessage}>Enviar Mensaje</button>
      </div>
      <button onClick={handleMarkAsSolved} className="ticket-solve-btn">
        Marcar como Resuelto
      </button>
    </div>
  );
};

export default TicketDetails;
