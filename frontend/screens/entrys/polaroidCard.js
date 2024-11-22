// PolaroidCard.js

import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const PolaroidCard = ({ entry, onPress }) => {
  const { categoria, nickname, fechaCreacion, color, media, emociones } = entry;

  // Formatear la fecha de creación
  const formattedFechaCreacion = fechaCreacion
    ? fechaCreacion.toDate().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.header}>
        <Text style={styles.tipoText}>{categoria}</Text>
      </View>
      <View style={styles.apodoContainer}>
        <Text style={styles.apodoText}>{nickname}</Text>
      </View>
      <View style={styles.contenidoContainer}>
        <Image
          source={{ uri: media }}
          style={styles.imagen}
          resizeMode="cover"
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.fechaText}>{formattedFechaCreacion}</Text>
      </View>
    </Pressable>
  );
};

PolaroidCard.propTypes = {
  entry: PropTypes.shape({
    categoria: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    fechaCreacion: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
    media: PropTypes.string,
    emociones: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    marginBottom: 10,
  },
  tipoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  apodoContainer: {
    marginBottom: 10,
  },
  apodoText: {
    fontSize: 16,
    color: "#fff",
  },
  contenidoContainer: {
    marginBottom: 10,
  },
  imagen: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  footer: {
    alignItems: "flex-end",
  },
  fechaText: {
    fontSize: 14,
    color: "#fff",
  },
});

export default PolaroidCard;
