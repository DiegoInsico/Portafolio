import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import EmotionFlag from "../../components/general/EmotionFlag";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";

const TextCard = ({ entry, onPress }) => {
  if (!entry) return null;

  const formattedFechaCreacion =
    entry.fechaCreacion?.toDate()?.toLocaleDateString("es-ES") || "";
  const { texto, emociones } = entry;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* Icono de emoción */}
      <View style={styles.emotionContainer}>
        <EmotionFlag emociones={emociones || []} />
      </View>

      {/* Contenido de la tarjeta */}
      <View style={styles.content}>
        {texto && (
          <Text style={styles.text} numberOfLines={3} ellipsizeMode="tail">
            {texto}
          </Text>
        )}
        {formattedFechaCreacion && (
          <Text style={styles.date}>{formattedFechaCreacion}</Text>
        )}
      </View>

      {/* Icono de flecha */}
      <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
    </Pressable>
  );
};

TextCard.propTypes = {
  entry: PropTypes.shape({
    texto: PropTypes.string,
    emociones: PropTypes.arrayOf(PropTypes.string),
    fechaCreacion: PropTypes.object,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emotionContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#888888",
  },
});

export default TextCard;
