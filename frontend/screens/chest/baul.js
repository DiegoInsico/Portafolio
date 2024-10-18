// ../screens/Baul.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { db, auth } from "../../utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";

const Baul = ({ navigation }) => {
  const [archivedEntries, setArchivedEntries] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        Alert.alert(
          "No autenticado",
          "Por favor, inicia sesión para acceder a esta sección."
        );
        navigation.navigate("Login");
      } else {
        const q = query(
          collection(db, "entries"),
          where("userId", "==", user.uid),
          where("archived", "==", true),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const entriesData = [];
            querySnapshot.forEach((doc) => {
              entriesData.push({ id: doc.id, ...doc.data() });
            });
            setArchivedEntries(entriesData);
          },
          (error) => {
            console.error("Error al obtener las entradas archivadas: ", error);
            Alert.alert(
              "Error",
              "Ocurrió un error al obtener las entradas archivadas."
            );
          }
        );

        return () => unsubscribe();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Función para restaurar una entrada desde el baúl
  const restoreEntry = async (id) => {
    Alert.alert(
      "Confirmar Restaurar",
      "¿Estás seguro de que deseas restaurar esta entrada?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Restaurar",
          onPress: async () => {
            try {
              const entryRef = doc(db, "entries", id);
              await updateDoc(entryRef, { archived: false });
              Alert.alert("Éxito", "Entrada restaurada exitosamente.");
            } catch (error) {
              console.error("Error al restaurar la entrada: ", error);
              Alert.alert("Error", "Hubo un error al restaurar la entrada.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.entryItem}>
      <Text style={styles.entryText}>{item.nickname}</Text>
      <TouchableOpacity onPress={() => restoreEntry(item.id)}>
        <Text style={styles.restoreText}>Restaurar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[
        "#D4AF37", // Dorado suave
        "#E6C47F", // Melocotón suave/dorado claro
        "#C2A66B", // Dorado oscuro más neutro
        "#4B4E6D", // Azul grisáceo oscuro para las sombras
        "#2C3E50", // Negro grisáceo oscuro en la parte inferior
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        {archivedEntries.length === 0 ? (
          <Text style={styles.emptyText}>No hay entradas en el Baúl.</Text>
        ) : (
          <FlatList
            data={archivedEntries}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>

    </LinearGradient>
  );
};

export default Baul;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "transparent",
  },
  entryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  entryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  restoreText: {
    color: "#28a745",
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
  },
});
