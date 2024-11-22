import { db } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

// Obtener tickets en tiempo real
export const getTickets = (setTickets) => {
  const ticketsRef = collection(db, "tickets");
  return onSnapshot(ticketsRef, (snapshot) => {
    const ticketList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTickets(ticketList);
  });
};

// Obtener lista de administradores
export const getAdminUsers = async () => {
  const adminsSnapshot = await getDocs(
    query(collection(db, "users"), where("role", "==", "admin"))
  );
  return adminsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Actualizar estado de ticket
export const updateTicketStatus = async (ticketId, status) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, { status });
};

// Asignar ticket a un administrador
export const assignTicket = async (ticketId, adminId, adminName) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    assignedTo: { adminId, adminName },
    status: "asignado",
  });
};

// Guardar mensaje en el ticket
export const saveMessage = async (ticketId, messageData) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, {
    messages: messageData,
  });
};
