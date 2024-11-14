// screens/Soporte/ListaTickets.js

import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function ListaTickets({ navigation }) { // Añadimos 'navigation' como prop
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
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
      Alert.alert("Error", "No se pudieron cargar tus tickets.");
    }
    setLoading(false);
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity 
      style={styles.ticketItem} 
      onPress={() => navigation.navigate('DetalleTicket', { ticketId: item.id })}
    >
      <Text style={styles.ticketSubject}>{item.subject}</Text>
      <Text style={styles.ticketStatus}>Estado: {item.status}</Text>
      <Text style={styles.ticketPriority}>Prioridad: {item.priority}</Text>
      <Text style={styles.ticketDate}>
        Creado: {item.createdAt?.toDate().toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 20,
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
    marginTop: 5,
  },
  ticketPriority: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 5,
  },
  ticketDate: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 5,
  },
  noTicketsText: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 20,
  },
});
