// screens/soporte/DetalleTicket.js

import React, { useState, useEffect, useContext, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  TextInput, 
  Button 
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function DetalleTicket({ route }) {
  const { ticketId } = route.params;
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef();

  useEffect(() => {
    fetchTicketDetails();
    const unsubscribeMessages = subscribeToMessages();
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeTicket) unsubscribeTicket();
    };
  }, []);

  const [unsubscribeTicket, setUnsubscribeTicket] = useState(null);

  const fetchTicketDetails = async () => {
    try {
      const ticketRef = doc(db, "tickets", ticketId);
      const unsubscribe = onSnapshot(ticketRef, (docSnap) => {
        if (docSnap.exists()) {
          setTicket({ id: docSnap.id, ...docSnap.data() });
        } else {
          Alert.alert("Error", "El ticket no existe.");
        }
        setLoading(false);
      }, (error) => {
        console.error("Error al obtener detalles del ticket:", error);
        Alert.alert("Error", "No se pudieron cargar los detalles del ticket.");
        setLoading(false);
      });
      setUnsubscribeTicket(() => unsubscribe);
    } catch (error) {
      console.error("Error al obtener detalles del ticket:", error);
      Alert.alert("Error", "No se pudieron cargar los detalles del ticket.");
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const messagesRef = collection(db, "tickets", ticketId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(messagesData);
    }, (error) => {
      console.error("Error al suscribirse a mensajes:", error);
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert("Error", "El mensaje no puede estar vacío.");
      return;
    }

    if (ticket.status === 'cerrado') {
      Alert.alert("Error", "Este ticket ha sido marcado como solucionado y no se pueden enviar más mensajes.");
      return;
    }

    try {
      const messagesRef = collection(db, "tickets", ticketId, "messages");
      await addDoc(messagesRef, {
        sender: "user",
        senderId: user.uid,
        text: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
      // Actualizar el campo updatedAt del ticket
      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, { updatedAt: serverTimestamp() });
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontraron detalles para este ticket.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        <View style={styles.ticketDetails}>
          <Text style={styles.subject}>{ticket.subject}</Text>
          <Text style={styles.description}>{ticket.description}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={styles.value}>{ticket.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Creado por:</Text>
            <Text style={styles.value}>{ticket.userName || "Tú"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha de Creación:</Text>
            <Text style={styles.value}>{ticket.createdAt?.toDate().toLocaleString()}</Text>
          </View>
        </View>

        {/* Sección de Conversación */}
        <View style={styles.chatContainer}>
          <Text style={styles.chatTitle}>Conversación</Text>
          {messages.length === 0 ? (
            <Text style={styles.noResponseText}>Aún no hay mensajes.</Text>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={
                  msg.sender === "admin" ? styles.chatBubbleAdmin : styles.chatBubbleUser
                }
              >
                <Text style={styles.chatText}>{msg.text}</Text>
                <Text style={styles.chatTimestamp}>
                  {msg.timestamp?.toDate().toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Campo para Enviar Nuevos Mensajes */}
      {ticket.status !== 'cerrado' ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu respuesta..."
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button title="Enviar" onPress={sendMessage} />
        </View>
      ) : (
        <View style={styles.closedTicketMessage}>
          <Text style={styles.closedTicketText}>Este ticket ha sido marcado como solucionado y no se pueden enviar más mensajes.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 70, // Ajusta según tu diseño
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ticketDetails: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  subject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#34495E",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
    width: 100,
  },
  value: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  chatContainer: {
    marginTop: 10,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 10,
  },
  chatBubbleUser: {
    backgroundColor: "#2ECC71",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-end",
    maxWidth: "80%",
    marginVertical: 5,
  },
  chatBubbleAdmin: {
    backgroundColor: "#3498DB",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
    maxWidth: "80%",
    marginVertical: 5,
  },
  chatText: {
    fontSize: 14,
    color: "#fff",
  },
  chatTimestamp: {
    fontSize: 10,
    color: "#ecf0f1",
    textAlign: "right",
    marginTop: 5,
  },
  noResponseText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#bdc3c7",
    backgroundColor: "#ecf0f1",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#7f8c8d",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: "#fff",
  },
  closedTicketMessage: {
    padding: 10,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  closedTicketText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginTop: 20,
  },
});
