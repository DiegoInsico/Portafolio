import React, { useEffect, useState } from "react";
import {getTickets, getEmployees, updateTicketStatus, assignTicket, } from "./ticketService";
import { ToastContainer, toast } from "react-toastify";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Modal, TextField, Typography, } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import TicketDetails from "./TicketDetails";
import "./inbox.css";
import { useNavigate } from "react-router-dom";

const Inbox = () => {
  // Estados
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterAssign, setFilterAssign] = useState(""); // Filtrar por asignado
  const [selectedTicket, setSelectedTicket] = useState(null); // Ticket seleccionado
  const [openModal, setOpenModal] = useState(false); // Modal abierto/cerrado
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // Obtener los tickets en tiempo real
  useEffect(() => {
    const unsubscribe = getTickets(setTickets);
    return () => unsubscribe();
  }, []);

  // Obtener la lista de empleados (Operadores y Administradores)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        toast.error("Error al obtener la lista de trabajadores.");
      }
    };
    fetchEmployees();
  }, []);

  // Abrir el modal de detalles
  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setOpenModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setSelectedTicket(null);
    setOpenModal(false);
  };

  // Asignar ticket a un trabajador
  const handleAssignTicket = async (ticketId, employeeId) => {
    try {
      await assignTicket(ticketId, employeeId);
      toast.success("Ticket asignado con éxito.");
    } catch (error) {
      toast.error("Error al asignar el ticket.");
    }
  };

  // Cerrar ticket (cambiar estado a cerrado)
  const handleCloseTicket = async (ticketId) => {
    try {
      await updateTicketStatus(ticketId, "cerrado");
      toast.success("Ticket cerrado con éxito.");
    } catch (error) {
      toast.error("Error al cerrar el ticket.");
    }
  };

  // Filtrar tickets por trabajador asignado
  const filteredTickets = filterAssign
    ? tickets.filter((ticket) => ticket.assignedTo === filterAssign)
    : tickets;

  return (
    <div className="inbox-container">
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        className="inbox-title"
      >
        Bandeja de Entrada - Tickets
      </Typography>

      {/* Filtros */}
      <Box className="filter-bar">
        <TextField
          placeholder="Filtrar por asignado a..."
          onChange={(e) => setFilterAssign(e.target.value)}
          size="small"
          className="filter-input"
        />
        <FormControl size="small" className="filter-select">
          <InputLabel>Filtrar por Asignado</InputLabel>
          <Select
            value={filterAssign}
            onChange={(e) => setFilterAssign(e.target.value)}
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.displayName} - {employee.role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabla de Tickets */}
      <div className="table-container">
        <DataGrid
          rows={filteredTickets.map((ticket) => ({
            ...ticket,
            id: ticket.id || "N/A",
            assignedTo: ticket.assignedTo || "",
            status: ticket.status || "abierto",
          }))}
          columns={[
            { field: "id", headerName: "ID", width: 100 },
            { field: "subject", headerName: "Asunto", width: 200 },
            { field: "userId", headerName: "Creado por (ID)", width: 150 },
            { field: "priority", headerName: "Prioridad", width: 100 },
            {
              field: "status",
              headerName: "Estado",
              width: 200,
              renderCell: (params) => {
                const handleChangeStatus = async (newStatus) => {
                  if (newStatus === "cerrado") {
                    if (
                      !window.confirm(
                        "¿Estás seguro de cerrar el ticket? Una vez cerrado no se podrá volver a abrir y este quedará como solucionado."
                      )
                    ) {
                      return;
                    }
                  }
                  try {
                    await updateTicketStatus(params.row.id, newStatus);
                    toast.success("Estado del ticket actualizado con éxito.");
                  } catch (error) {
                    toast.error("Error al actualizar el estado del ticket.");
                  }
                };

                return (
                  <FormControl fullWidth size="small">
                    <Select
                      value={params.row.status || ""}
                      onChange={(e) => handleChangeStatus(e.target.value)}
                    >
                      <MenuItem value="abierto">Abierto</MenuItem>
                      <MenuItem value="en progreso">En Progreso</MenuItem>
                      <MenuItem value="cerrado">Cerrado</MenuItem>
                    </Select>
                  </FormControl>
                );
              },
            },
            {
              field: "assignedTo",
              headerName: "Asignado a",
              width: 250,
              renderCell: (params) => {
                const handleAssign = async (employeeId) => {
                  try {
                    await assignTicket(params.row.id, employeeId);
                    toast.success("Ticket asignado con éxito.");
                  } catch (error) {
                    toast.error("Error al asignar el ticket.");
                  }
                };

                return (
                  <FormControl fullWidth size="small">
                    <Select
                      value={params.row.assignedTo || ""}
                      displayEmpty
                      onChange={(e) => handleAssign(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Sin asignar</em>
                      </MenuItem>
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.displayName} - {employee.role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              },
            },
            {
              field: "actions",
              headerName: "Acciones",
              renderCell: (params) => (
                <div className="actions-container">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenModal(params.row)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              ),
              width: 150,
            },
          ]}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          autoHeight
          disableSelectionOnClick
          className="tickets-table"
        />
      </div>

      {/* Modal de Detalles */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="ticket-details-title"
        aria-describedby="ticket-details-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "900px",
            bgcolor: "#1e1e1e",
            color: "#fff",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
            overflow: "hidden",
          }}
        >
          <TicketDetails ticket={selectedTicket} onClose={handleCloseModal} />
        </Box>
      </Modal>

      {/* Contenedor de Notificaciones */}
      <ToastContainer />
    </div>
  );
};

export default Inbox;
