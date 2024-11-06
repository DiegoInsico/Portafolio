// components/EmotionFlag.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { emotionToEmoji } from '../../utils/emotionUtils'; // Importa la función desde utils

const EmotionFlag = ({ emociones }) => {
    if (!emociones || emociones.length === 0) {
        return null; // No renderizar nada si no hay emociones
    }

    return (
        <View style={styles.emojiFlag}>
            {emociones.map((emotion, index) => (
                <Text key={index} style={styles.emoji}>
                    {emotionToEmoji(emotion)}
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    emojiFlag: {
        position: 'absolute',
        top: -15,  // Ajusta según tus necesidades
        right: -15,  // Ajusta según tus necesidades
        backgroundColor: '#4B4E6D', // Fondo alineado con los colores de la app
        borderRadius: 20,
        padding: 5,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 6, // Asegura que el emoji esté por encima de todo
        zIndex: 10, // Asegura que esté por encima de la imagen y otros elementos
    },
    emoji: {
        fontSize: 20,
        marginHorizontal: 3,
    },
});

export default EmotionFlag;
