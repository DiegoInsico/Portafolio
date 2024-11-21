// AudioCard.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import AudioPlayer from "../../components/audioPlayer";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import { emotionToEmoji } from "../../utils/emotionUtils";

const AudioCard = ({ entry, onPress }) => {
  if (!entry) return null;

  const formattedFechaCreacion =
    entry.fechaCreacion?.toDate()?.toLocaleDateString("es-ES") || "";
  const { audio, texto, emociones } = entry;

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
      {/* Emociones */}
      <View style={styles.emotionContainer}>{renderEmotions(emociones)}</View>

      {/* Contenido */}
      <View style={styles.content}>
        {texto && (
          <Text style={styles.text} numberOfLines={3} ellipsizeMode="tail">
            {texto}
          </Text>
        )}
        {audio && (
          <View style={styles.audioContainer}>
            <AudioPlayer audioUri={audio} />
          </View>
        )}
      </View>

      {/* Icono de flecha */}
      <MaterialIcons name="arrow-forward-ios" size={20} color="#ccc" />
    </Pressable>
  );
};

AudioCard.propTypes = {
  entry: PropTypes.shape({
    audio: PropTypes.string,
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
    flexDirection: "row",
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
  audioContainer: {
    marginTop: 8,
  },
  date: {
    fontSize: 14,
    color: "#888888",
    marginTop: 8,
  },
  emoji: {
    fontSize: 20,
    marginHorizontal: 3,
  },
});

export default AudioCard;
