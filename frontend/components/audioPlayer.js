import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider'; // Actualiza la importación
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importamos los íconos

const AudioPlayer = ({ audioUri }) => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    const loadAudio = async () => {
        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUri },
            { shouldPlay: false },
            onPlaybackStatusUpdate
        );
        setSound(sound);
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis);
            setIsPlaying(status.isPlaying);
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

    const onSeek = async (value) => {
        if (sound) {
            const seekPosition = value * duration;
            await sound.setPositionAsync(seekPosition);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                <Icon
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#fff"
                />
            </TouchableOpacity>
            <Slider
                style={styles.slider}
                value={position / duration}
                onValueChange={onSeek}
                minimumTrackTintColor="#1EB1FC"
                maximumTrackTintColor="#D3D3D3"
            />
            <Text style={styles.timer}>
                {Math.floor(position / 1000)} / {Math.floor(duration / 1000)} s
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        marginVertical: 10,
    },
    playButton: {
        backgroundColor: '#1EB1FC',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    timer: {
        marginLeft: 10,
        fontSize: 12,
        color: '#333',
    },
});

export default AudioPlayer;
