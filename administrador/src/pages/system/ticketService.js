// ticketService.js

import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  addDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Obtener tickets en tiempo real
export const getTickets = (setTickets) => {
  const ticketsRef = collection(db, "tickets");
  return onSnapshot(ticketsRef, (snapshot) => {
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Tickets obtenidos desde Firestore:", tickets);
    setTickets(tickets);
  });
};

// Obtener lista de trabajadores (Operadores y Administradores)
export const getEmployees = async () => {
  const employeesRef = collection(db, "employees");
  const employeesQuery = query(
    employeesRef,
    where("role", "in", ["Operador", "Administrador"])
  );
  const snapshot = await getDocs(employeesQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Actualizar estado de un ticket
export const updateTicketStatus = async (ticketId, status) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Asignar ticket a un trabajador
export const assignTicket = async (ticketId, employeeId) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    assignedTo: employeeId,
    updatedAt: serverTimestamp(),
  });
};

// Guardar mensaje en el chat de un ticket
export const saveMessage = async (ticketId, senderId, message, senderType) => {
  const messagesRef = collection(db, "tickets", ticketId, "messages");
  await addDoc(messagesRef, {
    text: message,
    senderId,
    senderType,
    timestamp: serverTimestamp(),
  });
};

// Obtener mensajes en tiempo real de un ticket
export const getTicketMessages = (ticketId, setMessages) => {
  const messagesRef = collection(db, "tickets", ticketId, "messages");
  const messagesQuery = query(messagesRef, where("timestamp", "!=", null));
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMessages(messages);
  });
};

export const getTicketsByRole = async (userId, role) => {
  try {
    const ticketsRef = collection(db, "tickets");
    let ticketsQuery;

    if (role === "admin") {
      ticketsQuery = ticketsRef; // Admin puede ver todos los tickets.
    } else if (role === "operador") {
      ticketsQuery = query(ticketsRef, where("assignedTo", "==", userId));
    }

    const snapshot = await getDocs(ticketsQuery);
    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return tickets;
  } catch (error) {
    console.error("Error al obtener los tickets:", error);
    throw error;
  }
};
