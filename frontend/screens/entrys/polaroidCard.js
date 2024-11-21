import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import EmotionFlag from "../../components/general/EmotionFlag";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";

const PolaroidCard = ({ entry, onPress }) => {
  if (!entry) return null;

  const { media, texto, emociones } = entry;

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {/* Imagen */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: media }}
          style={styles.image}
          resizeMode="cover" // Aseguramos que la imagen cubra todo el contenedor
        />
        {/* Si hay texto, mostrarlo sobre la imagen */}
        {texto && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText} numberOfLines={3}>
              {texto}
            </Text>
          </View>
        )}
      </View>

      {/* Footer con emoción y flecha */}
      <View style={styles.footer}>
        <EmotionFlag emociones={emociones || []} />
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
