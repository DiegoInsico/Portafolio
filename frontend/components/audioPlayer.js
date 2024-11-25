// ../../components/AudioPlayer.js

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Text } from "react-native"; // Añadido Text y Alert
import { Button } from "react-native-paper";
import { Audio } from "expo-av";

const AudioPlayer = ({ audioUri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null); // Estado para manejar errores

  const loadSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false } // Iniciar sin reproducir automáticamente
      );
      setSound(sound);
    } catch (e) {
      console.error("Error al cargar el audio:", e);
      setError("No se pudo cargar el audio.");
    }
  };

  useEffect(() => {
    if (audioUri) {
      loadSound();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const handlePlayPause = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } catch (e) {
        console.error("Error al reproducir/pausar el audio:", e);
        Alert.alert("Error", "Ocurrió un error al reproducir el audio.");
      }
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        onPress={handlePlayPause}
        icon={isPlaying ? "pause" : "play"}
        style={styles.button}
      >
        {isPlaying ? "Pausar" : "Reproducir"} Audio
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
  },
  button: {
    width: "60%",
  },
  errorText: {
    color: "#E74C3C",
    textAlign: "center",
  },
});

export default AudioPlayer;
