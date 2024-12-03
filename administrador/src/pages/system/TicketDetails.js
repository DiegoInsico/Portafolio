import React, { useEffect, useState } from "react";
import {
  saveMessage,
  getTicketMessages,
  updateTicketStatus,
} from "./ticketService";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "./TicketDetails.css";

const TicketDetails = ({ ticket, onClose }) => {
  console.log("Datos recibidos en TicketDetails:", ticket);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isResolved, setIsResolved] = useState(ticket.status === "cerrado");
  const assignedTo = ticket.assignedTo || "Sin asignar";
  const priority = ticket.priority || "No Definida";
  const createdAt = ticket.createdAt || "Fecha desconocida";

  // Obtener mensajes en tiempo real
  useEffect(() => {
    const unsubscribe = getTicketMessages(ticket.id, setMessages);
    return () => unsubscribe();
  }, [ticket.id]);

  // Manejar envío de mensaje
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("El mensaje no puede estar vacío.");
      return;
    }

    try {
      // Actualizar estado a "en progreso" si no está ya en este estado
      if (ticket.status !== "en progreso") {
        await updateTicketStatus(ticket.id, "en progreso");
        toast.info("El estado del ticket ha cambiado a 'En Progreso'.");
      }

      await saveMessage(ticket.id, "admin", newMessage, "admin");
      setNewMessage("");
      toast.success("Mensaje enviado.");
    } catch (error) {
      toast.error("Error al enviar el mensaje.");
    }
  };

  // Marcar ticket como resuelto
  const handleMarkAsResolved = () => {
    const toastId = toast(
      <div>
        <p>
          ¿Estás seguro de cerrar el ticket? <br />
          Una vez cerrado no se podrá volver a abrir y este quedará como
          solucionado.
        </p>
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={async () => {
              try {
                toast.dismiss(toastId);
                await updateTicketStatus(ticket.id, "cerrado");
                setIsResolved(true);
                toast.success("El ticket ha sido cerrado con éxito.");
                onClose(); // Cerramos el modal
              } catch (error) {
                toast.error("Hubo un error al cerrar el ticket.");
              }
            }}
            style={{
              backgroundColor: "#4caf50",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Aceptar
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              toast.info("El cierre del ticket ha sido cancelado.");
            }}
            style={{
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>,
      {
        closeOnClick: false,
        draggable: false,
        autoClose: false,
        toastId: "confirm-close-toast", // ID único para este toast
      }
    );
  };

  return (
    <div className="modal-container">
      <div className="header-container">
        <Button onClick={onClose} className="close-button" variant="contained">
          Cerrar
        </Button>
        <Typography variant="h5" className="modal-title">
          Detalles del Ticket
        </Typography>
        {!isResolved && (
          <Button
            onClick={handleMarkAsResolved}
            className="resolve-button"
            variant="contained"
          >
            Marcar como Resuelto
          </Button>
        )}
      </div>

      <div className="details-container">
        <div className="description-box">
          <Typography>
            <strong>Asunto:</strong> {ticket.subject || "Sin asunto"}
          </Typography>
          <Typography>
            <strong>Descripción:</strong>{" "}
            {ticket.description || "Sin descripción"}
          </Typography>
          <Typography>
            <strong>Estado:</strong> {ticket.status || "Sin estado"}
          </Typography>
          <Typography>
            <strong>Prioridad:</strong> {ticket.priority || "No definida"}
          </Typography>
          <Typography>
            <strong>Asignado a:</strong> {ticket.assignedTo || "Sin asignar"}
          </Typography>
          <Typography>
            <strong>Creado:</strong> {ticket.createdAt || "Fecha desconocida"}
          </Typography>
          <Typography>
            <strong>Última actualización:</strong>{" "}
            {ticket.updatedAt || "Sin fecha"}
          </Typography>
        </div>

        <div className="chat-container">
          <Typography variant="h6" gutterBottom>
            Chat del Ticket
          </Typography>
          <div className="chat-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.senderType === "admin" ? "worker" : "user"
                }`}
              >
                {message.text}
                <div className="chat-timestamp">
                  {new Date(message.timestamp?.toDate()).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isResolved && (
        <div className="chat-input-container">
          <input
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button className="chat-send-button" onClick={handleSendMessage}>
            Enviar
          </button>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default TicketDetails;
