// EntryCard.js

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const EntryCard = ({ entry, onPress }) => {
  const { categoria, nickname, color, nivel, fechaCreacion } = entry;

  // Formatear la fecha de creación
  const formattedFechaCreacion = fechaCreacion
    ? fechaCreacion.toDate().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Función para obtener el ícono del contenido basado en el tipo
  const getMediaIcon = () => {
    if (entry.mediaType) {
      switch (entry.mediaType) {
        case "video":
          return "video-outline";
        case "image":
          return "image-outline";
        default:
          return "file-outline";
      }
    } else if (entry.cancion) {
      return "spotify";
    } else if (entry.audio) {
      return "music-note";
    } else {
      return "text-box-outline";
    }
  };

  // Función para determinar el color del candado basado en el nivel
  const getLockIconColor = () => {
    switch (nivel) {
      case "1":
        return "#00BFFF"; // Celeste para Restringido
      case "2":
        return "#FF0000"; // Rojo para Rojo
      case "3":
        return "#000000"; // Negro para Confidencial
      default:
        return "#FFFFFF"; // Blanco por defecto
    }
  };

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: color || "#4B4E6D" }]}>
      <View style={styles.row}>
        {/* Ícono del contenido */}
        <Icon name={getMediaIcon()} size={50} color="#fff" style={styles.icon} />

        {/* Contenido a la derecha del ícono */}
        <View style={styles.content}>
          {/* Encabezado con categoría y candado */}
          <View style={styles.header}>
            <Text style={styles.category}>{categoria}</Text>
            <Icon name="lock" size={24} color={getLockIconColor()} style={styles.lockIcon} />
          </View>

          {/* Fecha debajo del encabezado */}
          <Text style={styles.fechaText}>{formattedFechaCreacion}</Text>

          {/* Línea divisoria */}
          <View style={styles.divider} />

          {/* Apodo */}
          <Text style={styles.nickname}>{nickname}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    backgroundColor: "#4B4E6D",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
    color: "#000",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  category: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  lockIcon: {
    marginLeft: 10,
  },
  fechaText: {
    fontSize: 14,
    color: "#000",
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 8,
  },
  nickname: {
    fontSize: 16,
    color: "#000",
  },
});

export default EntryCard;
