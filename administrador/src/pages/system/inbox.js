// src/pages/system/inbox.js

import React, { useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';
import './inbox.css'; // Asegúrate de crear este archivo de estilos
import { 
  DataGrid 
} from '@mui/x-data-grid';
import { 
  Button, 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Estilos para el Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  backgroundColor: '#fff',
  border: '2px solid #000',
  boxShadow: 24,
  padding: '20px',
};

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]); // Lista de usuarios con rol admin
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null); // Ticket seleccionado para detalles
  const [response, setResponse] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [open, setOpen] = useState(false); // Controla la apertura del modal
  const [editMode, setEditMode] = useState(false);

  // Escuchar cambios en la colección 'tickets'
  useEffect(() => {
    const ticketsRef = collection(db, 'tickets');
    const unsubscribe = onSnapshot(
      ticketsRef,
      async (snapshot) => {
        const ticketsList = await Promise.all(
          snapshot.docs.map(async (ticketDoc) => {
            const ticketData = ticketDoc.data();
            const userId = ticketData.userId;

            let displayName = "Usuario desconocido";
            if (userId) {
              const userRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                displayName = userDoc.data().displayName || "Usuario desconocido";
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

  // Obtener la lista de usuarios con rol 'admin' para asignar tickets
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminsSnapshot = await getDocs(adminsQuery); // Corregido: usar getDocs
        const adminsList = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminUsers(adminsList);
      } catch (error) {
        console.error("Error al obtener los usuarios admin:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  const handleOpen = (ticket) => {
    setSelectedTicket(ticket);
    setResponse(ticket.respuesta || '');
    setAssignTo(ticket.assignedTo || '');
    setEditMode(false);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedTicket(null);
    setResponse('');
    setAssignTo('');
    setEditMode(false);
    setOpen(false);
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error('Por favor, escribe una respuesta antes de enviar.');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, { 
        respuesta: response, 
        estado: "respondido",
        updatedAt: new Date()
      });
      toast.success('Respuesta enviada con éxito');

      // Actualizar el estado local
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, respuesta: response, estado: "respondido", updatedAt: new Date() } : ticket
        )
      );
      handleClose();
    } catch (error) {
      console.error("Error al enviar la respuesta:", error);
      toast.error('Error al enviar la respuesta. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdateResponse = async () => {
    if (!response.trim()) {
      toast.error('Por favor, escribe una respuesta antes de actualizar.');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, { 
        respuesta: response, 
        updatedAt: new Date()
      });
      toast.success('Respuesta actualizada con éxito');

      // Actualizar el estado local
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, respuesta: response, updatedAt: new Date() } : ticket
        )
      );
      handleClose();
    } catch (error) {
      console.error("Error al actualizar la respuesta:", error);
      toast.error('Error al actualizar la respuesta. Por favor, intenta de nuevo.');
    }
  };

  const handleAssign = async () => {
    if (!assignTo) {
      toast.error('Por favor, selecciona un administrador para asignar el ticket.');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, { 
        assignedTo: assignTo,
        updatedAt: new Date()
      });
      toast.success('Ticket asignado con éxito');

      // Actualizar el estado local
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, assignedTo: assignTo, updatedAt: new Date() } : ticket
        )
      );
      handleClose();
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
      toast.error('Error al asignar el ticket. Por favor, intenta de nuevo.');
    }
  };

  // Definir columnas para DataGrid
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'subject', headerName: 'Asunto', width: 250 },
    { field: 'displayName', headerName: 'Creado por', width: 180 },
    { field: 'priority', headerName: 'Prioridad', width: 120 },
    { field: 'status', headerName: 'Estado', width: 120 },
    { 
      field: 'assignedTo', 
      headerName: 'Asignado a', 
      width: 180,
      valueGetter: (params) => {
        if (!params || !params.row) return "Sin asignar";
        if (!params.row.assignedTo) return "Sin asignar";
        const admin = adminUsers.find(admin => admin.id === params.row.assignedTo);
        return admin ? admin.displayName : "Sin asignar";
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          onClick={() => handleOpen(params.row)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  // Opcional: Filtrar tickets por asignación
  const [filterAssign, setFilterAssign] = useState('');

  const handleFilterAssignChange = (event) => {
    setFilterAssign(event.target.value);
  };

  const filteredTickets = filterAssign
    ? tickets.filter(ticket => ticket.assignedTo === filterAssign)
    : tickets;

  return (
    <div className="inbox-container">
      <Typography variant="h4" align="center" gutterBottom>
        Bandeja de Entrada - Tickets de Soporte
      </Typography>

      {/* Sección de Filtros */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-assign-label">Filtrar por Asignado a</InputLabel>
          <Select
            labelId="filter-assign-label"
            id="filter-assign-select"
            value={filterAssign}
            onChange={handleFilterAssignChange}
            label="Filtrar por Asignado a"
          >
            <MenuItem value="">
              <em>Todos</em>
            </MenuItem>
            {adminUsers.map(admin => (
              <MenuItem key={admin.id} value={admin.id}>{admin.displayName}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <div className="data-grid-container">
        <DataGrid
          rows={filteredTickets}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[25, 50, 100]}
          disableSelectionOnClick
          autoHeight
          pagination
          components={{
            NoRowsOverlay: () => <Typography variant="body1">No hay tickets para mostrar</Typography>,
          }}
        />
      </div>

      {/* Modal para Detalles del Ticket */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="ticket-modal-title"
        aria-describedby="ticket-modal-description"
      >
        <Box sx={modalStyle}>
          {selectedTicket && (
            <>
              <Typography id="ticket-modal-title" variant="h6" component="h2">
                {selectedTicket.subject}
              </Typography>
              <Typography id="ticket-modal-description" sx={{ mt: 2 }}>
                <strong>Descripción:</strong> {selectedTicket.description}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Prioridad:</strong> {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Estado:</strong> {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Creado por:</strong> {selectedTicket.displayName}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Asignado a:</strong> {selectedTicket.assignedTo ? `Admin: ${adminUsers.find(admin => admin.id === selectedTicket.assignedTo)?.displayName || "Desconocido"}` : "Sin asignar"}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Estado de Respuesta:</strong> {selectedTicket.estado || "En espera"}
              </Typography>
              {selectedTicket.estado === "respondido" && (
                <Typography sx={{ mt: 1 }}>
                  <strong>Respuesta:</strong> {selectedTicket.respuesta}
                </Typography>
              )}

              {/* Sección de Respuesta */}
              {(selectedTicket.estado !== "respondido" || editMode) && (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Respuesta"
                    multiline
                    rows={4}
                    variant="outlined"
                    fullWidth
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={selectedTicket.estado === "respondido" ? handleUpdateResponse : handleSendResponse}
                      sx={{ mr: 2 }}
                    >
                      {selectedTicket.estado === "respondido" ? "Actualizar Respuesta" : "Enviar Respuesta"}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      onClick={handleClose}
                    >
                      Cancelar
                    </Button>
                  </Box>
                </Box>
              )}
              {selectedTicket.estado === "respondido" && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => {
                      setEditMode(true);
                      setResponse(selectedTicket.respuesta || '');
                    }}
                  >
                    Editar Respuesta
                  </Button>
                </Box>
              )}

              {/* Sección de Asignación */}
              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="assign-label">Asignar a</InputLabel>
                  <Select
                    labelId="assign-label"
                    id="assign-select"
                    value={assignTo}
                    label="Asignar a"
                    onChange={(e) => setAssignTo(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Selecciona un administrador</em>
                    </MenuItem>
                    {adminUsers.map(admin => (
                      <MenuItem key={admin.id} value={admin.id}>{admin.displayName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleAssign}
                  sx={{ mt: 2 }}
                  disabled={!assignTo}
                >
                  Asignar Ticket
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Contenedor de Notificaciones */}
      <ToastContainer />
    </div>
  );
};

export default Inbox;