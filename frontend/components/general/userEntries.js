// UserEntries.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { db } from "../../utils/firebase"; // Asegúrate de importar Firestore
import { collection, query, where, onSnapshot } from "firebase/firestore";

const UserEntries = ({ userId }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "entries"), where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesData);
    }, (error) => {
      console.error("Error al obtener las entradas: ", error);
      Alert.alert("Error", "Ocurrió un problema al obtener las entradas.");
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Historial de Entradas</Text>
      {entries.length === 0 ? (
        <Text>No hay entradas disponibles.</Text>
      ) : (
        <FlatList
          data={entries}
          renderItem={({ item }) => (
            <View style={styles.entryItem}>
              <Text style={styles.entryText}>{item.texto}</Text>
              <Text style={styles.entryDate}>{new Date(item.fechaCreacion.seconds * 1000).toLocaleDateString()}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFD700',
  },
  entryItem: {
    padding: 10,
    backgroundColor: '#34495E',
    borderRadius: 5,
    marginBottom: 10,
  },
  entryText: {
    color: '#fff',
  },
  entryDate: {
    color: '#ccc',
    fontSize: 12,
  },
});

export default UserEntries;
