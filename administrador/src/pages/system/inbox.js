// src/pages/system/inbox.js

import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./inbox.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Container from "../../components/container";

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTo, setAssignTo] = useState("");
  const [filterAssign, setFilterAssign] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda

  const navigate = useNavigate();

  // Obtener el administrador actual de manera dinámica
  const currentAdminId = "admin_id"; // Reemplaza esto con la lógica para obtener el ID del admin autenticado
  const currentAdminName = "Admin Actual"; // Reemplaza esto con la lógica para obtener el nombre del admin autenticado

  useEffect(() => {
    const ticketsRef = collection(db, "tickets");
    const unsubscribe = onSnapshot(
      ticketsRef,
      async (snapshot) => {
        const ticketsList = await Promise.all(
          snapshot.docs.map(async (ticketDoc) => {
            const ticketData = ticketDoc.data();
            const userId = ticketData.userId;

            let displayName = "Usuario desconocido";
            if (userId) {
              const userRef = doc(db, "users", userId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                displayName =
                  userDoc.data().displayName || "Usuario desconocido";
              }
            }

            return { id: ticketDoc.id, ...ticketData, displayName };
          })
        );

        setTickets(ticketsList);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener los tickets:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
    const unassignedTickets = tickets.filter((ticket) => !ticket.assignedTo);
    if (unassignedTickets.length > 0 && adminUsers.length > 0) {
      assignTicketsAutomatically(unassignedTickets);
    }
  }, [tickets, adminUsers]);

  const assignTicketsAutomatically = async (unassignedTickets) => {
    try {
      for (const ticket of unassignedTickets) {
        const adminWithLeastTickets = await getAdminWithLeastTickets();
        if (adminWithLeastTickets) {
          const ticketRef = doc(db, "tickets", ticket.id);
          await updateDoc(ticketRef, {
            assignedTo: adminWithLeastTickets.id,
            updatedAt: serverTimestamp(),
          });
          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              t.id === ticket.id
                ? { ...t, assignedTo: adminWithLeastTickets.id }
                : t
            )
          );
        }
      }
    } catch (error) {
      console.error("Error al asignar tickets automáticamente:", error);
    }
  };

  const getAdminWithLeastTickets = async () => {
    try {
      const adminTicketCounts = await Promise.all(
        adminUsers.map(async (admin) => {
          const q = query(
            collection(db, "tickets"),
            where("assignedTo", "==", admin.id),
            where("status", "!=", "cerrado")
          );
          const snapshot = await getDocs(q);
          return { admin, count: snapshot.size };
        })
      );
      adminTicketCounts.sort((a, b) => a.count - b.count);
      return adminTicketCounts[0].admin;
    } catch (error) {
      console.error("Error al obtener el admin con menos tickets:", error);
      return null;
    }
  };

  const handleOpen = (ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleAssign = async (ticketId, newAssignTo) => {
    if (!newAssignTo) {
      toast.error(
        "Por favor, selecciona un administrador para asignar el ticket."
      );
      return;
    }

    try {
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        assignedTo: newAssignTo,
        updatedAt: serverTimestamp(),
      });
      toast.success("Ticket asignado con éxito");
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, assignedTo: newAssignTo }
            : ticket
        )
      );
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
      toast.error("Error al asignar el ticket. Por favor, intenta de nuevo.");
    }
  };

  const handleFilterAssignChange = (event) => {
    setFilterAssign(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtrado condicional
  const filteredTickets = tickets.filter((ticket) => {
    const matchesAssignFilter = filterAssign
      ? ticket.assignedTo === filterAssign
      : true;
    const matchesSearchTerm = searchTerm
      ? ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesAssignFilter && matchesSearchTerm;
  });

  return (
      <div className="inbox-container">
        <h1 className="inbox-title">Bandeja de Entrada - Tickets de Soporte</h1>

        {/* Sección de Filtros */}
        <div className="inbox-filter-box">
          <label htmlFor="filter-assign-select" className="inbox-label">
            Filtrar por Asignado a : 
          </label>
          <select
            id="filter-assign-select"
            className="inbox-select"
            value={filterAssign}
            onChange={handleFilterAssignChange}
          >
            <option value="">Todos</option>
            {adminUsers.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.displayName}
              </option>
            ))}
          </select>

          {/* Input para la búsqueda */}
          <label htmlFor="search-input" className="inbox-label">
            Buscar :
          </label>
          <input
            id="search-input"
            type="text"
            className="inbox-search-input"
            placeholder="Asunto"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="inbox-data-container">
          <div className="data-content">
            <table className="inbox-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Asunto</th>
                  <th>Creado por</th>
                  <th>Estado</th>
                  <th>Asignado a</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.id}</td>
                    <td>{ticket.subject}</td>
                    <td>{ticket.displayName}</td>
                    <td>{ticket.status}</td>
                    <td>
                      {adminUsers.find(
                        (admin) => admin.id === ticket.assignedTo
                      )?.displayName || "Sin asignar"}
                    </td>
                    <td>
                      <button
                        className="inbox-btn"
                        onClick={() => handleOpen(ticket)}
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

        {/* Contenedor de Notificaciones */}
        <ToastContainer />
      </div>
  );
};

export default Inbox;
