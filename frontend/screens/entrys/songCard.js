import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Para iconos de controles de reproducción

const SongCard = ({ entry }) => {
    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { cancion, color, texto, audio, fechaCreacion } = entry;

    return (
        <View style={[styles.card, { borderColor: color }]}>
            {cancion && (
                <>
                    <Image source={{ uri: cancion.albumImage }} style={styles.albumImage} />
                    {fechaCreacion && (
                        <Text style={styles.date}>{formattedFechaCreacion}</Text>
                    )}
                    <Text style={styles.songName}>{cancion.name}</Text>
                    <Text style={styles.artistName}>{cancion.artist}</Text>

                    {/* Sección de controles (sólo iconos de ejemplo) */}
                    <View style={styles.controlsContainer}>
                        <MaterialIcons name="skip-previous" size={24} color="#333" />
                        <MaterialIcons name="play-arrow" size={24} color="#333" />
                        <MaterialIcons name="skip-next" size={24} color="#333" />
                    </View>
                </>
            )}

            <View style={styles.detailsContainer}>
                {texto && (
                    <Text style={styles.text}>{texto}</Text>
                )}
                {audio && (
                    // Integramos el AudioPlayer aquí si es necesario
                    <AudioPlayer audioUri={audio} />
                )}

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        alignContent:'center',
        backgroundColor: '#F4E4E4', // Fondo similar al de la imagen
        borderRadius: 15,
        borderWidth: 4,
        padding: 15,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
        width: 250, // Ancho fijo para la card
    },
    albumImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 5,
    },
    songName: {
        marginTop: 5,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    artistName: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    date: {
        fontSize: 12,
        color: '#999',
        position: 'absolute',
        bottom: 10,
        right: 15,
    },
    text: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        marginVertical: 10,
    },
    topText: {
        position: 'absolute',
        top: 5,
        fontSize: 12,
        color: '#888',
        textAlign: 'center',
        width: '100%',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '60%',
        marginVertical: 5,
    },
});

export default SongCard;
