import React, { useState, useEffect, useRef } from 'react';
import { View, Pressable, Animated, Easing, Text, Alert, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const AudioRecorder = ({ onRecordingComplete }) => {
    const [recording, setRecording] = useState(null);
    const [audioUri, setAudioUri] = useState(null);
    const [sound, setSound] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [audioPosition, setAudioPosition] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const scaleAnim = useRef(new Animated.Value(1)).current; // Animación de escala

    useEffect(() => {
        // Solicitar permisos al montar el componente
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso Denegado', 'Necesitamos permiso para acceder al micrófono.');
            }
        })();

        return () => {
            // Limpiar recursos al desmontar el componente
            if (sound) {
                sound.unloadAsync().catch(error => console.log('Error descargando el sonido:', error));
            }
            if (recording && recording.stopAndUnloadAsync) {
                recording.stopAndUnloadAsync().catch(error => console.log('Error deteniendo la grabación:', error));
            }
        };
    }, []);

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopPulseAnimation = () => {
        scaleAnim.stopAnimation();
        scaleAnim.setValue(1);
    };

    const iniciarGrabacion = async () => {
        try {
            // Si hay una grabación en progreso, detenerla antes de iniciar otra
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            startPulseAnimation();
        } catch (error) {
            console.log('Error al iniciar la grabación:', error);
            Alert.alert('Error', 'No se pudo iniciar la grabación de audio.');
        }
    };

    const detenerGrabacion = async () => {
        try {
            if (recording) {
                setIsRecording(false);
                stopPulseAnimation();
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                setAudioUri(uri);
                onRecordingComplete({ uri });
                obtenerDuracionAudio(uri);
                setRecording(null);
            } else {
                console.log('No hay grabación activa o no se puede detener.');
            }
        } catch (error) {
            console.log('Error al detener la grabación:', error);
            Alert.alert('Error', 'No se pudo detener la grabación de audio.');
        }
    };

    const obtenerDuracionAudio = async (uri) => {
        try {
            const { sound: tempSound, status } = await Audio.Sound.createAsync(
                { uri },
                {},
                null
            );
            setAudioDuration(status.durationMillis);
            tempSound.unloadAsync(); // Descargar el sonido después de obtener la duración
        } catch (error) {
            console.log('Error al obtener la duración del audio:', error);
        }
    };

    const reproducirAudio = async () => {
        try {
            if (audioUri) {
                // Si ya hay un sonido cargado, descargarlo
                if (sound) {
                    await sound.unloadAsync();
                    setSound(null);
                }

                const { sound: newSound, status } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    {
                        shouldPlay: true,
                        progressUpdateIntervalMillis: 100,
                        onPlaybackStatusUpdate: handlePlaybackStatusUpdate,
                    }
                );

                setSound(newSound);
                setIsPlaying(true);
            }
        } catch (error) {
            console.log('Error al reproducir audio:', error);
            Alert.alert('Error', 'No se pudo reproducir el audio.');
        }
    };

    const pausarAudio = async () => {
        if (sound) {
            try {
                await sound.pauseAsync();
                setIsPlaying(false);
            } catch (error) {
                console.log('Error al pausar el audio:', error);
            }
        }
    };

    const detenerAudio = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                setIsPlaying(false);
                setAudioPosition(0);
                progressAnim.setValue(0);
            } catch (error) {
                console.log('Error al detener el audio:', error);
            }
        }
    };

    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setAudioDuration(status.durationMillis);
            setAudioPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);

            Animated.timing(progressAnim, {
                toValue: status.positionMillis / status.durationMillis,
                duration: 100,
                useNativeDriver: false,
            }).start();
        }

        if (status.didJustFinish) {
            setIsPlaying(false);
            progressAnim.setValue(0);
        }
    };

    const handleEliminarAudio = () => {
        if (sound) {
            sound.unloadAsync().catch(error => console.log('Error descargando el sonido:', error));
            setSound(null);
        }
        setAudioUri(null);
        setAudioDuration(0);
        setAudioPosition(0);
        progressAnim.setValue(0);
    };

    // Formatear tiempo en mm:ss
    const formatearTiempo = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.audioContainer}>
            {!audioUri && !isRecording && (
                <Pressable onPress={iniciarGrabacion}>
                    <Animated.View style={[
                        styles.botonAudio,
                        isRecording && styles.botonAudioGrabando,
                        { transform: [{ scale: scaleAnim }] },
                    ]}>
                        <FontAwesome
                            name="microphone"
                            size={30}
                            color={isRecording ? 'white' : '#007BFF'}
                        />
                    </Animated.View>
                </Pressable>
            )}

            {isRecording && (
                <Pressable onPress={detenerGrabacion}>
                    <Animated.View style={[
                        styles.botonAudio,
                        styles.botonAudioGrabando,
                        { transform: [{ scale: scaleAnim }] },
                    ]}>
                        <FontAwesome
                            name="microphone"
                            size={30}
                            color="white"
                        />
                    </Animated.View>
                </Pressable>
            )}

            {audioUri && !isRecording && (
                <View style={styles.audioPlaybackContainer}>
                    <Pressable onPress={isPlaying ? pausarAudio : reproducirAudio}>
                        <MaterialIcons
                            name={isPlaying ? 'pause' : 'play-arrow'}
                            size={30}
                            color="#17a2b8"
                        />
                    </Pressable>
                    <View style={styles.progressBarContainer}>
                        <Animated.View style={[styles.progressBar, {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ["0%", "100%"]
                            })
                        }]} />
                    </View>
                    <Text style={styles.audioTime}>
                        {formatearTiempo(audioPosition)} / {formatearTiempo(audioDuration)}
                    </Text>
                    <Pressable onPress={handleEliminarAudio} style={styles.botonEliminarAudio}>
                        <MaterialIcons name="delete" size={30} color="red" />
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    audioContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    botonAudio: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    botonAudioGrabando: {
        backgroundColor: '#FFA500',
    },
    audioPlaybackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    progressBarContainer: {
        height: 5,
        width: 100,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#17a2b8',
    },
    audioTime: {
        fontSize: 14,
        color: '#555',
    },
    botonEliminarAudio: {
        marginLeft: 10,
    },
});

export default AudioRecorder;
