import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PolaroidCard = ({ entry }) => {
    if (!entry) {
        // Si entry es undefined, no se renderiza nada
        return null;
    }

    const { media, mediaType, categoria, texto, fechaCreacion } = entry;

    return (
        <View style={styles.card}>
            {media && mediaType === 'image' && (
                <Image source={{ uri: media }} style={styles.image} />
            )}
            <View style={styles.content}>
                <Text style={styles.category}>{categoria || "Sin categoría"}</Text>
                <Text style={styles.text}>{texto || "Sin texto disponible"}</Text>
                {fechaCreacion && (
                    <Text style={styles.date}>{fechaCreacion}</Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    content: {
        marginTop: 10,
    },
    category: {
        fontWeight: 'bold',
    },
    text: {
        marginTop: 5,
        fontSize: 16,
    },
    date: {
        marginTop: 5,
        fontSize: 12,
        color: '#888',
    },
});

export default PolaroidCard;
