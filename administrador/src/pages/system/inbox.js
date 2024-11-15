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
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import './inbox.css';
import { 
  DataGrid 
} from '@mui/x-data-grid';
import { 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel,
  Select, 
  MenuItem,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/container';

const Inbox = () => {
  const [tickets, setTickets] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTo, setAssignTo] = useState('');
  const [filterAssign, setFilterAssign] = useState('');
  
  const navigate = useNavigate();
  
  // Obtener el administrador actual de manera dinámica
  const currentAdminId = 'admin_id'; // Reemplaza esto con la lógica para obtener el ID del admin autenticado
  const currentAdminName = 'Admin Actual'; // Reemplaza esto con la lógica para obtener el nombre del admin autenticado

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

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
        const adminsSnapshot = await getDocs(adminsQuery);
        const adminsList = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAdminUsers(adminsList);
      } catch (error) {
        console.error("Error al obtener los usuarios admin:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  useEffect(() => {
    const unassignedTickets = tickets.filter(ticket => !ticket.assignedTo);
    if (unassignedTickets.length > 0 && adminUsers.length > 0) {
      assignTicketsAutomatically(unassignedTickets);
    }
  }, [tickets, adminUsers]);

  const assignTicketsAutomatically = async (unassignedTickets) => {
    try {
      for (const ticket of unassignedTickets) {
        const adminWithLeastTickets = await getAdminWithLeastTickets();
        if (adminWithLeastTickets) {
          const ticketRef = doc(db, 'tickets', ticket.id);
          await updateDoc(ticketRef, { 
            assignedTo: adminWithLeastTickets.id,
            updatedAt: serverTimestamp()
          });
          setTickets(prevTickets =>
            prevTickets.map(t =>
              t.id === ticket.id ? { ...t, assignedTo: adminWithLeastTickets.id } : t
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
      const adminTicketCounts = await Promise.all(adminUsers.map(async (admin) => {
        const q = query(collection(db, 'tickets'), where('assignedTo', '==', admin.id), where('status', '!=', 'cerrado'));
        const snapshot = await getDocs(q);
        return { admin, count: snapshot.size };
      }));
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
      toast.error('Por favor, selecciona un administrador para asignar el ticket.');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, { 
        assignedTo: newAssignTo,
        updatedAt: serverTimestamp()
      });
      toast.success('Ticket asignado con éxito');
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === ticketId ? { ...ticket, assignedTo: newAssignTo } : ticket
        )
      );
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
      toast.error('Error al asignar el ticket. Por favor, intenta de nuevo.');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'subject', headerName: 'Asunto', width: 250 },
    { field: 'displayName', headerName: 'Creado por', width: 180 },
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

  const handleFilterAssignChange = (event) => {
    setFilterAssign(event.target.value);
  };

  const filteredTickets = filterAssign
    ? tickets.filter(ticket => ticket.assignedTo === filterAssign)
    : tickets;

  return (
    <Container>
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
          getRowId={(row) => row.id}
          components={{
            NoRowsOverlay: () => <Typography variant="body1">No hay tickets para mostrar</Typography>,
          }}
        />
      </div>

      {/* Contenedor de Notificaciones */}
      <ToastContainer />
    </div>
    </Container>
  );
};

export default Inbox;
