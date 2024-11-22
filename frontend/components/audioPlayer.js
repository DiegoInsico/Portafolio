// AudioPlayer.js

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';

const AudioPlayer = ({ audioUri }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1); // Evitar división por cero
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    if (audioUri) {
      loadAudio();
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUri]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: false, isLooping: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.log('Error al cargar el audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1); // Evitar división por cero
      setIsPlaying(status.isPlaying);
      setIsBuffering(status.isBuffering);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      await loadAudio();
    }
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!audioUri) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
        <FontAwesome name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={position / duration}
          onSlidingComplete={(value) =>
            sound && sound.setPositionAsync(value * duration)
          }
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#FFFFFF"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>
    </View>
  );
};

AudioPlayer.propTypes = {
  audioUri: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828', // Fondo oscuro similar a Spotify
    borderRadius: 10,
    padding: 10,
    marginBottom: 13,
  },
  playButton: {
    backgroundColor: '#1DB954', // Verde característico de Spotify
    padding: 12,
    borderRadius: 30,
    marginRight: 10,
  },
  sliderContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});

export default AudioPlayer;
