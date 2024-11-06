import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import EmotionFlag from '../../components/general/EmotionFlag';
import AudioPlayer from '../../components/audioPlayer';

const TextCard = ({ entry, onPress }) => {

    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { texto, audio, color, fechaCreacion, emociones } = entry;

    return (
        <Pressable onPress={onPress} style={styles.noteWrapper}>
            <View style={[styles.card, { borderLeftColor: color || '#FFD700' }]}>
                <EmotionFlag emociones={emociones} />

                {texto && (
                    <Text style={styles.text}>{texto}</Text>
                )}
                {audio && (
                    <AudioPlayer audioUri={audio} />
                )}
                {fechaCreacion && (
                    <Text style={styles.date}>{formattedFechaCreacion}</Text>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    noteWrapper: {
        alignItems: 'center',
        marginVertical: 15,
    },
    card: {
        backgroundColor: '#FFF9E6',
        borderWidth: 2,
        borderLeftWidth: 8,
        borderLeftColor: '#FFD700',
        borderRadius: 12,
        padding: 20,
        paddingVertical: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
        width: 320,
        position: 'relative',
    },
    text: {
        fontSize: 16,
        lineHeight: 26,
        color: '#333',
        fontWeight: '400',
        fontStyle: 'italic',
        textAlign: 'left', // Alineación a la izquierda
        marginBottom: 12,
    },
    date: {
        fontSize: 12,
        color: '#888',
        position: 'absolute',
        bottom: 12,
        right: 15,
    },
});

export default TextCard;
