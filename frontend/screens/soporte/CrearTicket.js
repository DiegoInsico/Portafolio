// screens/Soporte/CrearTicket.js

import React, { useState, useContext } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../utils/firebase";

export default function CrearTicket() {
  const { user } = useContext(AuthContext);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media"); // Default priority

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }

    try {
      await addDoc(collection(db, "tickets"), {
        userId: user.uid,
        subject,
        description,
        status: "abierto",
        priority,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assignedTo: null,
      });
      Alert.alert("Éxito", "Tu ticket ha sido creado correctamente.");
      setSubject("");
      setDescription("");
      setPriority("media");
    } catch (error) {
      console.error("Error al crear ticket:", error);
      Alert.alert("Error", "No se pudo crear el ticket. Inténtalo de nuevo.");
    }
  };

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
      {/* Opcional: Selector de Prioridad */}
      <View style={styles.priorityContainer}>
        <Text style={styles.label}>Prioridad:</Text>
        <Picker
          selectedValue={priority}
          style={styles.picker}
          onValueChange={(itemValue) => setPriority(itemValue)}
        >
          <Picker.Item label="Baja" value="baja" />
          <Picker.Item label="Media" value="media" />
          <Picker.Item label="Alta" value="alta" />
        </Picker>
      </View>
      <Pressable style={styles.button} onPress={handleCreateTicket}>
        <Text style={styles.buttonText}>Enviar Ticket</Text>
      </Pressable>
    </View>
  );
}

import { Picker } from '@react-native-picker/picker'; // Asegúrate de instalar esta dependencia

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
  input: {
    borderWidth: 1,
    borderColor: "#34495E",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: "#2C3E50",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#2C3E50",
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 150,
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#2C3E50",
    fontWeight: "bold",
    fontSize: 16,
  },
});
