import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';

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


const PolaroidCard = ({ entry, onPress }) => {

    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion && entry.fechaCreacion.toDate
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : ''; // Verificamos que 'fechaCreacion' exista y tenga el método 'toDate'

    const { media, mediaType, fechaCreacion, texto, audio, color, emociones } = entry;

    return (

        <Pressable onPress={onPress} style={styles.polaroidWrapper}>
            <View style={[styles.polaroidContainer, { borderColor: color || '#ffffff' }]}>
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
                        <AudioPlayer audioUri={audio} />
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    polaroidWrapper: {
        alignItems: 'center',
        marginVertical: 20,
    },
    polaroidContainer: {
        backgroundColor: '#F4E4E4',
        paddingBottom: 40,
        paddingTop: 20,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        borderWidth: 4,
        shadowRadius: 5,
        elevation: 5,
        width: Dimensions.get('window').width * 0.6,
        borderRadius: 10,
        position: 'relative',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    dateContainer: {
        position: 'absolute',
        top: 15,  // Bajamos la fecha ligeramente
        right: 10, // Mantenemos la fecha en la esquina superior derecha
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderRadius: 5,
    },
    date: {
        fontSize: 12,
        color: '#fff',
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
    /* Estilo para el contenedor de emojis estilo bandera */
    emojiFlag: {
        position: 'absolute',
        top: -15,  // Subimos los emojis por encima de la tarjeta
        right: -15,  // Posicionamos los emojis fuera de la esquina derecha
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

export default PolaroidCard;
