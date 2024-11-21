import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import { emotionToEmoji } from "../../utils/emotionUtils";

const PolaroidCard = ({ entry, onPress }) => {
  if (!entry) return null;

  const { media, fechaCreacion, emociones } = entry;

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = date.toDate();
    return dateObj.toLocaleDateString("es-ES");
  };

  const renderEmotions = (emotions) => {
    if (!emotions || emotions.length === 0) return null;
    return emotions.map((emotion, index) => (
      <Text key={index} style={styles.emoji}>
        {emotionToEmoji(emotion)}
      </Text>
    ));
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: media }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.footer}>
        <View style={styles.emotionsContainer}>{renderEmotions(emociones)}</View>
        <Text style={styles.dateText}>
          {fechaCreacion ? formatDate(fechaCreacion) : ""}
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
      </View>
    </Pressable>
  );
};

PolaroidCard.propTypes = {
  entry: PropTypes.shape({
    media: PropTypes.string,
    texto: PropTypes.string,
    emociones: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1, // Mantener proporción cuadrada
    backgroundColor: "#cccccc",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  overlayText: {
    color: "#ffffff",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});

export default PolaroidCard;
