import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Para iconos de controles de reproducción

// Función para mapear emociones a emojis
const emotionToEmoji = (emotion) => {
    switch (emotion.toLowerCase()) {
        case 'alegría':
            return '😊';
        case 'tristeza':
            return '😢';
        case 'amor':
            return '❤️';
        case 'nostalgia':
            return '😌';
        case 'gratitud':
            return '🙏';
        case 'enfado':
            return '😡';
        case 'sorpresa':
            return '😲';
        case 'miedo':
            return '😨';
        case 'orgullo':
            return '😏';
        case 'vergüenza':
            return '😳';
        case 'ansiedad':
            return '😰';
        case 'esperanza':
            return '🌈';
        case 'confusión':
            return '😕';
        case 'inspiración':
            return '💡';
        case 'determinación':
            return '💪';
        case 'calma':
            return '😌';
        case 'euforia':
            return '🤩';
        case 'melancolía':
            return '😔';
        case 'arrepentimiento':
            return '😞';
        case 'frustración':
            return '😤';
        case 'diversión':
            return '😄';
        case 'satisfacción':
            return '😌';
        case 'culpa':
            return '😓';
        case 'alivio':
            return '😅';
        case 'curiosidad':
            return '🤔';
        case 'solidaridad':
            return '🤝';
        case 'fascinación':
            return '😍';
        case 'empatía':
            return '🤗';
        case 'cansancio':
            return '😩';
        case 'paz':
            return '🕊️';
        case 'resignación':
            return '😞';
        case 'admiración':
            return '👏';
        case 'ansia':
            return '🥺';
        case 'compasión':
            return '💞';
        case 'motivación':
            return '🔥';
        case 'soledad':
            return '😔';
        case 'ternura':
            return '🥰';
        default:
            return '🙂'; // Emoji por defecto si no se reconoce la emoción
    }
};

const SongCard = ({ entry }) => {
    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { cancion, color, texto, audio, fechaCreacion, emociones } = entry;

    return (
        <View style={[styles.card, { borderColor: color }]}>
            {/* Mostrar emociones flotantes en una "bandera" sobre la tarjeta */}
            {emociones && emociones.length > 0 && (
                <View style={styles.emojiFlag}>
                    {emociones.map((emotion, index) => (
                        <Text key={index} style={styles.emoji}>
                            {emotionToEmoji(emotion)}
                        </Text>
                    ))}
                </View>
            )}

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
        alignContent: 'center',
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
        position: 'relative',
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
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '60%',
        marginVertical: 5,
    },
    /* Estilo para el contenedor de emojis estilo bandera */
    emojiFlag: {
        position: 'absolute',
        top: -10,  // Posicionamos la "bandera" por encima de la tarjeta
        right: -10,  // Posicionamos a la derecha
        backgroundColor: '#4B4E6D', // Fondo alineado con los colores de la app
        borderRadius: 20,
        padding: 5,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 6, // Aseguramos que el emoji esté por encima de todo
        zIndex: 10, // Aseguramos que esté por encima de la imagen y otros elementos
    },
    emoji: {
        fontSize: 20,
        marginHorizontal: 3,
    },
});

export default SongCard;
