import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from 'react-native';
import EmotionFlag from '../../components/general/EmotionFlag'; // Importa el componente EmotionFlag
import AudioPlayer from '../../components/audioPlayer';
import PropTypes from 'prop-types';

const PolaroidCard = ({ entry, onPress }) => {
    if (!entry) {
        return null;
    }

    const formattedFechaCreacion = entry.fechaCreacion && entry.fechaCreacion.toDate
        ? entry.fechaCreacion.toDate().toLocaleDateString('es-ES')
        : '';

    const { media, mediaType, texto, audio, color, emociones } = entry;

    return (
        <Pressable onPress={onPress} style={styles.polaroidWrapper}>
            <View style={[styles.polaroidContainer, { borderColor: color || '#ffffff' }]}>
                <EmotionFlag emociones={emociones || []} />

                <View style={styles.imageContainer}>
                    {media && mediaType === 'image' && (
                        <Image source={{ uri: media }} style={styles.image} />
                    )}

                    {formattedFechaCreacion && (
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

PolaroidCard.propTypes = {
    entry: PropTypes.shape({
        media: PropTypes.string,
        mediaType: PropTypes.string,
        fechaCreacion: PropTypes.object,
        texto: PropTypes.string,
        audio: PropTypes.string,
        color: PropTypes.string,
        emociones: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    polaroidWrapper: {
        alignItems: 'center',
        marginVertical: 20,
    },
    polaroidContainer: {
        backgroundColor: '#FFFDF4',
        paddingBottom: 25,
        paddingTop: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        borderWidth: 3,
        borderColor: '#E1E1E1',
        shadowRadius: 8,
        elevation: 6,
        width: Dimensions.get('window').width * 0.7,
        borderRadius: 12,
        position: 'relative',
    },
    imageContainer: {
        width: '100%',
        height: 270,
        backgroundColor: '#f2f2f2',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    dateContainer: {
        position: 'absolute',
        top: 15,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 8,
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
        color: '#333',
        fontStyle: 'italic',
    },
});

export default PolaroidCard;
