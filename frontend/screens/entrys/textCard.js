import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AudioPlayer from '../../components/audioPlayer'; // Importa el componente que creamos anteriormente

// Función para convertir las emociones en emojis
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

const TextCard = ({ entry }) => {
    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { texto, audio, color, fechaCreacion, emociones } = entry;

    return (
        <View style={styles.noteWrapper}>
            <View style={[styles.card, { borderLeftColor: color || '#f28b82' }]}>
                {/* Emociones flotantes sobre la tarjeta de texto */}
                {emociones && emociones.length > 0 && (
                    <View style={styles.emojiFlag}>
                        {emociones.map((emotion, index) => (
                            <Text key={index} style={styles.emoji}>
                                {emotionToEmoji(emotion)}
                            </Text>
                        ))}
                    </View>
                )}

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
        </View>
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
        zIndex: 10, // Aseguramos que esté por encima de otros elementos
    },
    emoji: {
        fontSize: 20,
        marginHorizontal: 3,
    },
});

export default TextCard;
