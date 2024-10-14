// src/components/SideBar.js
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const SideBar = ({ visible, onClose }) => {
    const [isMounted, setIsMounted] = useState(visible);
    const slideAnim = useRef(new Animated.Value(width)).current; // Inicialmente fuera de la pantalla a la derecha

    useEffect(() => {
        if (visible) {
            setIsMounted(true); // Montar el componente
            // Animación de entrada
            Animated.timing(slideAnim, {
                toValue: width * 0.25, // Desliza hasta ocupar el 75% de la pantalla (100% - 25%)
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Animación de salida
            Animated.timing(slideAnim, {
                toValue: width,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setIsMounted(false); // Desmontar el componente después de la animación
            });
        }
    }, [visible, slideAnim]);

    if (!isMounted) return null; // No renderizar nada si no está montado

    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <TouchableWithoutFeedback>
                    <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
                        {/* Parte Superior: Título o Información */}
                        <View style={styles.header}>
                            <Text style={styles.headerText}>Menú</Text>
                        </View>

                        {/* Opciones de Navegación */}
                        <View style={styles.optionsContainer}>
                            <TouchableOpacity style={styles.optionButton}>
                                <FontAwesome name="tree" size={24} color="#333" />
                                <Text style={styles.optionText}>Árbol de Vida</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionButton}>
                                <FontAwesome name="users" size={24} color="#333" />
                                <Text style={styles.optionText}>Beneficiarios</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionButton}>
                                <FontAwesome name="clock-o" size={24} color="#333" />
                                <Text style={styles.optionText}>Mensajes Programados</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Parte Inferior: Botón de Cerrar Sesión */}
                        <View style={styles.logoutContainer}>
                            <TouchableOpacity style={styles.logoutButton}>
                                <FontAwesome name="sign-out" size={24} color="#d9534f" />
                                <Text style={styles.logoutText}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
};

SideBar.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semi-transparente
        top: 0,
        left: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: width * 0.75, // 75% del ancho de la pantalla
        height: '100%',
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        // Sombra para dar efecto de elevación
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
    },
    header: {
        marginBottom: 30,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    optionsContainer: {
        flex: 1,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    optionText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    logoutContainer: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#d9534f',
        fontWeight: 'bold',
    },
});

export default SideBar;
