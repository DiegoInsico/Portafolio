import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const PolaroidCard = ({ entry }) => {
    if (!entry) {
        return null;
    }
    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { media, mediaType, fechaCreacion, texto, audio, color } = entry;

    return (
        <View style={styles.polaroidWrapper}>
            <View style={[styles.polaroidContainer, {  borderColor: color || '#ffffff' }]}>
                <View style={styles.imageContainer}>
                    {media && mediaType === 'image' && (
                        <Image source={{ uri: media }} style={styles.image} />
                    )}
                    {fechaCreacion && (
                        <View style={styles.dateContainer}>
                            <Text style={styles.date}>{formattedFechaCreacion}</Text>
                        </View>
                    )}
                </View>
                <View style={styles.detailsContainer}>
                    {texto && (
                        <Text style={styles.text}>{texto}</Text>
                    )}
                    {audio && (
                        // Integramos el AudioPlayer aquí
                        <AudioPlayer audioUri={audio} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    polaroidWrapper: {
        alignItems: 'center',
        marginVertical: 20,
    },
    polaroidContainer: {
        backgroundColor: '#F4E4E4', // Fondo de la tarjeta
        paddingBottom: 40, // Mayor padding en la parte inferior
        paddingTop: 20,
        paddingHorizontal: 10, // Hacemos los lados más delgados
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        borderWidth: 4,
        shadowRadius: 5,
        elevation: 5,
        width: Dimensions.get('window').width * 0.6, // La tarjeta es más delgada (60% del ancho de la pantalla)
        borderRadius: 10, // Bordes redondeados
    },
    imageContainer: {
        width: '100%',
        height: 300, // Imagen más alargada
        backgroundColor: '#000', // Fondo de la imagen si no se carga
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover', // Asegura que la imagen cubra el contenedor
    },
    dateContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo oscuro para resaltar la fecha
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 5,
    },
    date: {
        fontSize: 12,
        color: '#fff', // Texto blanco
    },
    detailsContainer: {
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
        color: '#000',
    },
});

export default PolaroidCard;
