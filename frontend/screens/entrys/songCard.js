import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import EmotionFlag from '../../components/general/EmotionFlag';
import AudioPlayer from '../../components/audioPlayer';
import { MaterialIcons } from '@expo/vector-icons';

const SongCard = ({ entry, onPress }) => {

    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { cancion, color, texto, audio, emociones } = entry;

    return (
        <Pressable onPress={onPress} style={[styles.card, { borderColor: color || '#ddd' }]}>
            <EmotionFlag emociones={emociones} />

            {cancion && (
                <>
                    <Image source={{ uri: cancion.albumImage }} style={styles.albumImage} />
                    {formattedFechaCreacion && (
                        <Text style={styles.date}>{formattedFechaCreacion}</Text>
                    )}
                    <Text style={styles.songName}>{cancion.name}</Text>
                    <Text style={styles.artistName}>{cancion.artist}</Text>

                    <View style={styles.controlsContainer}>
                        <MaterialIcons name="skip-previous" size={28} color="#FFD700" />
                        <MaterialIcons name="play-arrow" size={28} color="#FFD700" />
                        <MaterialIcons name="skip-next" size={28} color="#FFD700" />
                    </View>
                </>
            )}

            <View style={styles.detailsContainer}>
                {texto && (
                    <Text style={styles.text}>{texto}</Text>
                )}
                {audio && (
                    <AudioPlayer audioUri={audio} />
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        alignItems: 'center',
        backgroundColor: '#FFFDF4',
        borderRadius: 18,
        borderWidth: 3,
        paddingVertical: 20,
        paddingHorizontal: 15,
        marginVertical: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        width: 280,
        position: 'relative',
    },
    albumImage: {
        width: 220,
        height: 220,
        borderRadius: 15,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    songName: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 20,
        textAlign: 'center',
        color: '#333',
    },
    artistName: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginBottom: 10,
    },
    date: {
        fontSize: 12,
        color: '#999',
        position: 'absolute',
        top: 10,
        right: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 5,
        color: '#fff',
    },
    text: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginVertical: 10,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '70%',
        marginVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        paddingTop: 5,
    },
});

export default SongCard;
