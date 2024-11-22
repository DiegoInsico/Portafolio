// TextCard.js

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const TextCard = ({ entry, onPress }) => {
  const { categoria, nickname, fechaCreacion, color, texto, emociones } = entry;

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
        {texto ? (
          <Text style={styles.texto} numberOfLines={3} ellipsizeMode="tail">
            {texto}
          </Text>
        ) : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.fechaText}>{formattedFechaCreacion}</Text>
      </View>
    </Pressable>
  );
};

TextCard.propTypes = {
  entry: PropTypes.shape({
    categoria: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    fechaCreacion: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
    texto: PropTypes.string,
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
    shadowColor: "#000",
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
  texto: {
    fontSize: 16,
    color: "#fff",
  },
  footer: {
    alignItems: "flex-end",
  },
  fechaText: {
    fontSize: 14,
    color: "#fff",
  },
});

export default TextCard;
