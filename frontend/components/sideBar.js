import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const SideBar = ({ visible, onClose }) => {
    const slideAnim = useRef(new Animated.Value(width)).current; // Inicialmente fuera de la pantalla (derecha)
    const navigation = useNavigation(); // Hook de React Navigation

    useEffect(() => {
        if (visible) {
            // Animación de entrada (deslizar hacia la pantalla)
            Animated.timing(slideAnim, {
                toValue: 0, // Se mueve a 0 para estar visible completamente
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // Animación de salida (deslizar fuera de la pantalla)
            Animated.timing(slideAnim, {
                toValue: width, // Se mueve fuera de la pantalla
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, slideAnim]);

    // Si visible es true, renderizamos el Sidebar
    if (!visible) return null;

    return (
        <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
                    <ImageBackground
                        source={require("../assets/test/fondo5.webp")} // Ruta a tu imagen de fondo
                        style={styles.backgroundImage}
                    >
                        <View style={styles.overlayDarken} />

                        <View style={styles.contentContainer}>
                            <View style={styles.profileContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        onClose(); // Cerrar el SideBar al navegar
                                        navigation.navigate('EditProfile'); // Redirigir a la pestaña de perfil
                                    }}
                                >
                                    <FontAwesome name="user-circle" size={80} color="#FFFFFF" />
                                </TouchableOpacity>
                                <Text style={styles.profileName}>Usuario</Text>
                            </View>

                            {/* Opciones de Navegación */}
                            <View style={styles.optionsContainer}>
                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('ArbolDeVida');
                                    }}
                                >
                                    <FontAwesome name="tree" size={24} color="#FFFFFF" />
                                    <Text style={styles.optionText}>Árbol de Vida</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('MensajesProgramados');
                                    }}
                                >
                                    <FontAwesome name="clock-o" size={24} color="#FFFFFF" />
                                    <Text style={styles.optionText}>Mensajes Programados</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        navigation.navigate('config');
                                    }}
                                >
                                    <FontAwesome name="gear" size={24} color="#FFFFFF" />
                                    <Text style={styles.optionText}>Configuraciones</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.optionButton}
                                    onPress={() => {
                                        onClose();
                                        auth.signOut()
                                            .then(() => {
                                                navigation.navigate('Login');
                                            })
                                            .catch((error) => {
                                                Alert.alert('Error', 'No se pudo cerrar sesión.');
                                            });
                                    }}
                                >
                                    <FontAwesome name="sign-out" size={24} color="#d9534f" />
                                    <Text style={styles.optionText}>Cerrar Sesión</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semi-transparente
        top: 0,
        left: 0,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        zIndex: 100, // Asegurar que el Sidebar esté sobre otros elementos
    },
    sidebar: {
        position: 'absolute',
        top: 0,
        right: 0, // Cambiar a right para que venga de la derecha
        width: width * 0.75, // 75% del ancho de la pantalla
        height: '100%',
        justifyContent: 'flex-start',
        zIndex: 200, // Asegurarse de que esté sobre el fondo
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // Ajustar la imagen de fondo para cubrir todo el Sidebar
        width: '100%',
        height: '100%',
    },
    overlayDarken: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Oscurecer la imagen de fondo
    },
    contentContainer: {
        flex: 1,
        zIndex: 300, // Asegurar que el contenido esté sobre la capa oscura
    },
    profileContainer: {
        marginTop: 30,
        alignItems: 'center',
        marginBottom: 30,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF', // Blanco para mejor contraste
        marginTop: 10,
    },
    optionsContainer: {
        marginLeft: 10,
        flex: 1,
        justifyContent: 'flex-start',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    optionText: {
        fontSize: 16,
        marginLeft: 15,
        color: '#FFFFFF', // Blanco para mejor contraste
    },
});

export default SideBar;
