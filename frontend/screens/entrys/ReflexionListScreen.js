// ReflexionListScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../utils/firebase"; // Asegúrate de que la ruta es correcta

const ReflexionListScreen = () => {
  const route = useRoute();
  const { entryId } = route.params;

  const [reflexiones, setReflexiones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (entryId) {
      const reflexionesRef = collection(db, "entradas", entryId, "reflexiones");
      const q = query(reflexionesRef, orderBy("fecha", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const reflexionesList = [];
          querySnapshot.forEach((doc) => {
            reflexionesList.push({ id: doc.id, ...doc.data() });
          });
          setReflexiones(reflexionesList);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error al obtener reflexiones:", error);
          setIsLoading(false);
          Alert.alert("Error", "No se pudieron obtener las reflexiones.");
        }
      );

      return () => unsubscribe();
    }
  }, [entryId]);

  const renderReflexion = ({ item }) => (
    <View style={styles.reflexionCard}>
      <Avatar.Icon size={40} icon="account" />
      <View style={styles.reflexionContent}>
        <Text style={styles.reflexionTexto}>{item.texto}</Text>
        <Text style={styles.reflexionFecha}>
          {new Date(item.fecha.seconds * 1000).toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator animating={true} size="large" color="#758E4F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {reflexiones.length > 0 ? (
        <FlatList
          data={reflexiones}
          keyExtractor={(item) => item.id}
          renderItem={renderReflexion}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.centeredContainer}>
          <Text style={styles.noReflectionsText}>No hay reflexiones disponibles.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  listContainer: {
    padding: 20,
    paddingTop: 90,
  },
  reflexionCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#1E1E1E",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  reflexionContent: {
    marginLeft: 10,
    flex: 1,
  },
  reflexionTexto: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  reflexionFecha: {
    fontSize: 12,
    color: "#AAAAAA",
    textAlign: "right",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReflectionsText: {
    fontSize: 16,
    color: "#888888",
  },
});

export default ReflexionListScreen;
