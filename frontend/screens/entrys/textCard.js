import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AudioPlayer from '../../components/audioPlayer'; // Importa el componente que creamos anteriormente

const TextCard = ({ entry, onPress }) => {
    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { texto, audio, color, fechaCreacion } = entry;

    return (
        <Pressable onPress={onPress} style={styles.noteWrapper}>
            <View style={[styles.card, { borderLeftColor: color || '#f28b82' }]}>
                {/* Mostrar texto si está disponible */}
                {texto && (
                    <Text style={styles.text}>{texto}</Text>
                )}
                {/* Mostrar reproductor de audio si está disponible */}
                {audio && (
                    <AudioPlayer audioUri={audio} />
                )}
                {/* Mostrar la fecha de creación */}
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
        marginVertical: 10,
    },
    card: {
        backgroundColor: '#F4E4E4', // Fondo fijo
        borderWidth: 4, // Borde de la tarjeta
        borderRadius: 10, // Borde redondeado
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        width: 300, // Ancho fijo para un diseño uniforme
        height: 'auto', // Altura según el contenido
        position: 'relative',
        borderLeftWidth: 10, // Borde ancho en la izquierda
        borderLeftColor: '#f28b82', // Color predeterminado para la línea del cuaderno
    },
    text: {
        fontSize: 16,
        marginBottom: 10,
        lineHeight: 24,
        fontStyle: 'italic', // Puedes usar esto para un estilo más personal
        color: '#333',
        fontFamily: 'serif', // Estilo más clásico
    },
    date: {
        fontSize: 12,
        color: '#666',
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
});

export default TextCard;
