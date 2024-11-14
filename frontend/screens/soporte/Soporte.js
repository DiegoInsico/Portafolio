// screens/soporte/Soporte.js

import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function Soporte({ navigation }) {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const ticketsData = [];
      querySnapshot.forEach((doc) => {
        ticketsData.push({ id: doc.id, ...doc.data() });
      });
      setTickets(ticketsData);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
      Alert.alert("Error", "No se pudieron cargar los tickets.");
    }
    setLoading(false);
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      const ticketsRef = collection(db, "tickets");
      await addDoc(ticketsRef, {
        userId: user.uid,
        subject,
        description,
        status: "abierto",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: null,
      });
      Alert.alert("Éxito", "Ticket creado correctamente.");
      setSubject("");
      setDescription("");
      fetchTickets();
    } catch (error) {
      console.error("Error al crear ticket:", error);
      Alert.alert("Error", "No se pudo crear el ticket.");
    }
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => navigation.navigate('DetalleTicket', { ticketId: item.id })}
    >
      <Text style={styles.ticketSubject}>{item.subject}</Text>
      <Text style={styles.ticketStatus}>Estado: {item.status}</Text>
      <Text style={styles.ticketDate}>
        Creado: {item.createdAt?.toDate().toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Ticket</Text>
      <TextInput
        style={styles.input}
        placeholder="Asunto"
        value={subject}
        onChangeText={setSubject}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <Pressable style={styles.button} onPress={handleCreateTicket}>
        <Text style={styles.buttonText}>Enviar Ticket</Text>
      </Pressable>

      <Text style={styles.title}>Tus Tickets</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : tickets.length === 0 ? (
        <Text style={styles.noTicketsText}>No tienes tickets creados.</Text>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.ticketList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 70, // Ajusta según tu diseño
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#34495E",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    color: "#2C3E50",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#2C3E50",
    fontWeight: "bold",
    fontSize: 16,
  },
  ticketList: {
    paddingBottom: 20,
  },
  ticketItem: {
    backgroundColor: "#ECF0F1",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  ticketStatus: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  ticketDate: {
    fontSize: 12,
    color: "#95A5A6",
  },
  noTicketsText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 20,
  },
});
