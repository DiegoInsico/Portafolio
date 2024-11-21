import React, { useEffect, useState, useRef } from "react";
import Container from "../../components/container";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./TicketDetails.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuth } from "firebase/auth";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [assignTo, setAssignTo] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const auth = getAuth();
  const currentAdminId = auth.currentUser ? auth.currentUser.uid : null;
  const currentAdminName = auth.currentUser
    ? auth.currentUser.displayName
    : "Administrador";

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, "tickets", id);
        const ticketDoc = await getDoc(ticketRef);
        if (ticketDoc.exists()) {
          const ticketData = ticketDoc.data();
          const userId = ticketData.userId;

          let displayName = "Usuario desconocido";
          if (userId) {
            const userRef = doc(db, "users", userId);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              displayName = userDoc.data().displayName || "Usuario desconocido";
            }
          }

          setTicket({ id: ticketDoc.id, ...ticketData, displayName });
          setAssignTo(ticketData.assignedTo || "");
        } else {
          toast.error("Ticket no encontrado.");
          navigate("/");
        }
      } catch (error) {
        console.error("Error al obtener el ticket:", error);
        toast.error("Error al obtener el ticket.");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const adminsQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminsSnapshot = await getDocs(adminsQuery);
        const adminsList = adminsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdminUsers(adminsList);
      } catch (error) {
        console.error("Error al obtener los usuarios admin:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  useEffect(() => {
    if (ticket) {
      const messagesRef = collection(db, "tickets", ticket.id, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      const unsubscribe = onSnapshot(
        q,
        async (snapshot) => {
          const messagesData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const msgData = doc.data();
              let senderName = "Desconocido";

              if (msgData.sender === "admin") {
                const admin = adminUsers.find(
                  (admin) => admin.id === msgData.senderId
                );
                senderName = admin ? admin.displayName : "Administrador";
              } else if (msgData.sender === "user") {
                senderName = ticket.displayName || "Usuario";
              }

              return { id: doc.id, ...msgData, senderName };
            })
          );
          setMessages(messagesData);
          scrollToBottom();
        },
        (error) => {
          console.error("Error al obtener mensajes:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [ticket, adminUsers]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Por favor, escribe un mensaje antes de enviar.");
      return;
    }

    if (ticket.status === "cerrado") {
      toast.error(
        "El ticket está marcado como solucionado y no se pueden enviar más mensajes."
      );
      return;
    }

    try {
      const messagesRef = collection(db, "tickets", ticket.id, "messages");
      await addDoc(messagesRef, {
        sender: "admin",
        senderId: currentAdminId,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, { updatedAt: serverTimestamp() });

      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      toast.error("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    }
  };

  const handleAssign = async () => {
    if (!assignTo) {
      toast.error(
        "Por favor, selecciona un administrador para asignar el ticket."
      );
      return;
    }

    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        assignedTo: assignTo,
        updatedAt: serverTimestamp(),
      });
      toast.success("Ticket asignado con éxito");
      setTicket((prevTicket) => ({ ...prevTicket, assignedTo: assignTo }));
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
      toast.error("Error al asignar el ticket. Por favor, intenta de nuevo.");
    }
  };

  const handleMarkAsSolved = async () => {
    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, {
        status: "cerrado",
        updatedAt: serverTimestamp(),
      });
      toast.success("Ticket marcado como solucionado");
      setTicket((prevTicket) => ({ ...prevTicket, status: "cerrado" }));
    } catch (error) {
      console.error("Error al marcar el ticket como solucionado:", error);
      toast.error(
        "Error al marcar el ticket como solucionado. Por favor, intenta de nuevo."
      );
    }
  };

  if (loading || !ticket) {
    return (
      <div className="ticket-details-container">
        <h6 className="ticket-loading">Cargando detalles del ticket...</h6>
      </div>
    );
  }

  return (        
      <div className="ticket-details-container">
        <div className="ticket-header">
          <h5>Asunto: {ticket.subject}</h5>
          <button onClick={() => navigate(-1)} className="ticket-btn-close">
            X
          </button>
        </div>

        <div className="ticket-assignment-section">
          <label>Asignar a: </label>
          <select
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            className="ticket-assign-select"
          >
            <option value="">Selecciona un administrador</option>
            {adminUsers.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.displayName}
              </option>
            ))}
          </select>
          <button onClick={handleAssign} className="ticket-assign-button">
            Asignar
          </button>
        </div>

        <div className="ticket-description-section">
          <p>
            <strong>Descripción:</strong> {ticket.description}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </p>
          <p>
            <strong>Creado por:</strong> {ticket.displayName}
          </p>
          <p>
            <strong>Asignado a:</strong>{" "}
            {ticket.assignedTo
              ? `${
                  adminUsers.find((admin) => admin.id === ticket.assignedTo)
                    ?.displayName || "Desconocido"
                }`
              : "Sin asignar"}
          </p>
        </div>

        <div className="ticket-chat-section">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`ticket-message ${
                msg.sender === "admin"
                  ? "ticket-admin-message"
                  : "ticket-user-message"
              }`}
            >
              <span className="ticket-message-sender">{msg.senderName}</span>
              <div className="ticket-message-bubble">
                <p>{msg.text}</p>
                <span className="ticket-message-time">
                  {new Date(msg.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== "cerrado" && (
          <div className="ticket-send-message-bar">
            <textarea
              placeholder="Escribe un mensaje"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="ticket-message-input"
            />
            <button onClick={handleSendMessage} className="ticket-send-button">
              Enviar
            </button>
          </div>
        )}

        {ticket.status !== "cerrado" && (
          <div className="ticket-mark-solved-section">
            <button
              onClick={handleMarkAsSolved}
              className="ticket-mark-solved-button"
            >
              Marcar como Solucionado
            </button>
          </div>
        )}

        <ToastContainer />
      </div>
  );
};

export default TicketDetails;
