// CustomSwitch.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

const CustomSwitch = ({
    option1 = "Texto",
    option2 = "Audio",
    color1 = "#007BFF", // Color cuando está en OFF (Texto)
    color2 = "#4CAF50", // Color cuando está en ON (Audio)
    value = false,       // Estado controlado por el padre
    onSwitch,            // Función para cambiar el estado en el padre
}) => {
    const slideAnim = useRef(new Animated.Value(value ? 1 : 0)).current; // Animación deslizante

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: value ? 1 : 0, // Cambiar el valor de animación según la selección
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: false,
        }).start();
    }, [value]);

    const handleSwitch = () => {
        onSwitch(!value); // Cambiar el estado en el padre
    };

    // Interpolación del color de fondo según la selección
    const backgroundColor = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [color1, color2],
    });

    // Animación para deslizar el botón
    const translateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80], // Desplazamiento del deslizador entre opciones
    });

    return (
        <View style={styles.switchContainer}>
            <Animated.View style={[styles.sliderBackground, { backgroundColor }]}>
                <TouchableOpacity onPress={handleSwitch} activeOpacity={0.8}>
                    <Animated.View style={[styles.switchThumb, { transform: [{ translateX }] }]}>
                        <Text style={styles.thumbText}>{value ? option2 : option1}</Text>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 160, // Ancho del switch total
    },
    sliderBackground: {
        width: 150, // Ancho del fondo del deslizador
        height: 35, // Alto del fondo del deslizador
        borderRadius: 20,
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    switchThumb: {
        width: 60,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#fff', // Color del deslizador
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3, // Sombra para el deslizador
    },
    thumbText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default CustomSwitch;
