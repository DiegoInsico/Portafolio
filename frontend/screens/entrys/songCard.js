// SongCard.js
import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import AudioPlayer from "../../components/audioPlayer";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import { emotionToEmoji } from "../../utils/emotionUtils";

const SongCard = ({ entry, onPress }) => {
  if (!entry) return null;

  const { cancion, texto, emociones } = entry;

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
      {/* Imagen del álbum */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: cancion.albumImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Información de la canción */}
        <View style={styles.overlay}>
          <Text style={styles.songName} numberOfLines={1}>
            {cancion.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {cancion.artist}
          </Text>
        </View>
      </View>

      {/* Contenido adicional */}
      {texto && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{texto}</Text>
        </View>
      )}

      {/* Reproductor de audio */}
      {cancion.previewUrl && (
        <View style={styles.audioContainer}>
          <AudioPlayer audioUri={cancion.previewUrl} />
        </View>
      )}

      {/* Footer con emociones y flecha */}
      <View style={styles.footer}>
        <View style={styles.emotionsContainer}>{renderEmotions(emociones)}</View>
        <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
      </View>
    </Pressable>
  );
};

SongCard.propTypes = {
  entry: PropTypes.shape({
    cancion: PropTypes.shape({
      albumImage: PropTypes.string,
      name: PropTypes.string,
      artist: PropTypes.string,
      previewUrl: PropTypes.string,
    }),
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 10,
  },
  songName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  artistName: {
    color: "#cccccc",
    fontSize: 14,
  },
  textContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  text: {
    fontSize: 16,
    color: "#333333",
  },
  audioContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  emotionsContainer: {
    flexDirection: "row",
  },
  emoji: {
    fontSize: 20,
    marginHorizontal: 3,
  },
});

export default SongCard;
