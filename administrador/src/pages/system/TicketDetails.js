// src/pages/system/TicketDetails.js

import React, { useEffect, useState, useRef } from 'react';
import { 
  useParams, 
  useNavigate 
} from 'react-router-dom';
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
} from 'firebase/firestore';
import { db } from '../../firebase';
import './TicketDetails.css';
import { 
  Button, 
  Box, 
  Typography, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  IconButton,
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth } from 'firebase/auth';

const TicketDetails = () => {
  const { id } = useParams(); // Obtener el ID del ticket desde la URL
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Obtener el administrador actual de manera dinámica
  const auth = getAuth();
  const currentAdminId = auth.currentUser ? auth.currentUser.uid : null;
  const currentAdminName = auth.currentUser ? auth.currentUser.displayName : 'Administrador';

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const ticketRef = doc(db, 'tickets', id);
        const ticketDoc = await getDoc(ticketRef);
        if (ticketDoc.exists()) {
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

          setTicket({ id: ticketDoc.id, ...ticketData, displayName });
          setAssignTo(ticketData.assignedTo || '');
        } else {
          toast.error('Ticket no encontrado.');
          navigate('/');
        }
      } catch (error) {
        console.error("Error al obtener el ticket:", error);
        toast.error('Error al obtener el ticket.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

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
    if (ticket) {
      const messagesRef = collection(db, 'tickets', ticket.id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const messagesData = await Promise.all(snapshot.docs.map(async (doc) => {
          const msgData = doc.data();
          let senderName = "Desconocido";

          if (msgData.sender === 'admin') {
            const admin = adminUsers.find(admin => admin.id === msgData.senderId);
            senderName = admin ? admin.displayName : "Administrador";
          } else if (msgData.sender === 'user') {
            senderName = ticket.displayName || "Usuario";
          }

          return { id: doc.id, ...msgData, senderName };
        }));
        setMessages(messagesData);
        scrollToBottom();
      }, (error) => {
        console.error("Error al obtener mensajes:", error);
      });

      return () => unsubscribe();
    }
  }, [ticket, adminUsers]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('Por favor, escribe un mensaje antes de enviar.');
      return;
    }

    if (ticket.status === 'cerrado') {
      toast.error('El ticket está marcado como solucionado y no se pueden enviar más mensajes.');
      return;
    }

    try {
      const messagesRef = collection(db, 'tickets', ticket.id, 'messages');
      await addDoc(messagesRef, {
        sender: 'admin',
        senderId: currentAdminId,
        text: newMessage,
        timestamp: serverTimestamp(),
      });

      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, { updatedAt: serverTimestamp() });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      toast.error('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    }
  };

  const handleAssign = async () => {
    if (!assignTo) {
      toast.error('Por favor, selecciona un administrador para asignar el ticket.');
      return;
    }

    try {
      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, { 
        assignedTo: assignTo,
        updatedAt: serverTimestamp()
      });
      toast.success('Ticket asignado con éxito');
      setTicket(prevTicket => ({ ...prevTicket, assignedTo: assignTo }));
    } catch (error) {
      console.error("Error al asignar el ticket:", error);
      toast.error('Error al asignar el ticket. Por favor, intenta de nuevo.');
    }
  };

  const handleMarkAsSolved = async () => {
    try {
      const ticketRef = doc(db, 'tickets', ticket.id);
      await updateDoc(ticketRef, { 
        status: 'cerrado',
        updatedAt: serverTimestamp()
      });
      toast.success('Ticket marcado como solucionado');
      setTicket(prevTicket => ({ ...prevTicket, status: 'cerrado' }));
    } catch (error) {
      console.error("Error al marcar el ticket como solucionado:", error);
      toast.error('Error al marcar el ticket como solucionado. Por favor, intenta de nuevo.');
    }
  };

  if (loading || !ticket) {
    return (
      <div className="ticket-details-container">
        <Typography variant="h6" align="center">
          Cargando detalles del ticket...
        </Typography>
      </div>
    );
  }

  return (
    <div className="ticket-details-container">
      {/* Header */}
      <Box className="header">
        <Typography variant="h5">{ticket.subject}</Typography>
        <IconButton onClick={() => navigate(-1)} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Asignación y Botón de Asignar */}
      <Box className="assignment-section">
        <FormControl variant="outlined" size="small" className="assign-select">
          <InputLabel id="assign-label">Asignar a</InputLabel>
          <Select
            labelId="assign-label"
            id="assign-select"
            value={assignTo}
            onChange={(e) => setAssignTo(e.target.value)}
            label="Asignar a"
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
          disabled={!assignTo}
          size="small"
          className="assign-button"
        >
          Asignar
        </Button>
      </Box>

      {/* Descripción del Ticket */}
      <Box className="description-section">
        <Typography variant="body1"><strong>Descripción:</strong> {ticket.description}</Typography>
        <Typography variant="body1"><strong>Estado:</strong> {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</Typography>
        <Typography variant="body1"><strong>Creado por:</strong> {ticket.displayName}</Typography>
        <Typography variant="body1"><strong>Asignado a:</strong> {ticket.assignedTo ? `${adminUsers.find(admin => admin.id === ticket.assignedTo)?.displayName || "Desconocido"}` : "Sin asignar"}</Typography>
      </Box>

      {/* Sección de Conversación */}
      <Box className="chat-section">
        <List>
          {messages.map(msg => (
            <ListItem key={msg.id} alignItems="flex-start" className={`message-item ${msg.sender === 'admin' ? 'admin-message' : 'user-message'}`}>
              <ListItemAvatar>
                <Avatar>
                  {msg.senderName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <Paper className="message-bubble">
                <ListItemText
                  primary={msg.senderName}
                  secondary={
                    <>
                      <Typography variant="body2" color="textPrimary">
                        {msg.text}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(msg.timestamp?.toDate()).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Barra de Envío de Mensajes */}
      {ticket.status !== 'cerrado' && (
        <Box className="send-message-bar">
          <TextField
            label="Escribe un mensaje"
            variant="outlined"
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            size="small"
          />
          <IconButton color="primary" onClick={handleSendMessage} size="small">
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Botón para marcar como solucionado */}
      {ticket.status !== 'cerrado' && (
        <Box className="mark-solved-section">
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleMarkAsSolved}
            size="small"
          >
            Marcar como Solucionado
          </Button>
        </Box>
      )}

      {/* Contenedor de Notificaciones */}
      <ToastContainer />
    </div>
  );
};

export default TicketDetails;
