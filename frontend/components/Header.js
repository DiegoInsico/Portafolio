// src/components/Navbar.js
import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalEntry from '../screens/entrys/modalEntry';
import SideBar from './sideBar/sideBar';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import PropTypes from 'prop-types';

export default function Navbar({ onOptionsPress }) { // Acepta la prop onOptionsPress
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  

  const handlePress2 = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const [selectedButton, setSelectedButton] = useState(null);

  // Refs para la escala animada
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleOptions = useRef(new Animated.Value(1)).current;

  // Función para manejar la animación y la selección de botones
  const handlePress = (buttonName, scaleRef) => {
    setSelectedButton(buttonName);

    // Animar el botón presionado
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Función para manejar el cierre de sesión
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert("Éxito", "Has cerrado sesión correctamente.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Ocurrió un error al cerrar sesión.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <ModalEntry
        visible={modalVisible}
        onClose={handleCloseModal}
      />
      <View style={styles.navbar}>

        {/* Botón de la Casa */}
        <Pressable
          onPress={() => handlePress('home', scaleHome)}
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleHome }] },
              selectedButton === 'home' && styles.selectedButton
            ]}
          >
            <FontAwesome
              name="home"
              size={30}
              color={selectedButton === 'home' ? 'black' : "white"}
            />
          </Animated.View>
        </Pressable>

        {/* Botón del Centro */}
        <Pressable
          onPress={handlePress2}
        >
          <Animated.View
            style={[
              styles.centerButton,
              { transform: [{ scale: scaleAdd }] },
              selectedButton === 'add' && styles.selectedButton
            ]}
          >
            <FontAwesome
              name="plus"
              size={40}
              color={selectedButton === 'add' ? 'black' : "white"}
            />
          </Animated.View>
        </Pressable>

        {/* Botón de Opciones (reemplazando al Perfil) */}
        <Pressable
          onPress={() => {
            handlePress('options', scaleOptions);
            if (onOptionsPress) onOptionsPress(); // Llamar a la función para abrir el SideBar
          }}
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleOptions }] },
              selectedButton === 'options' && styles.selectedButton
            ]}
          >
            <FontAwesome
              name="bars" // Icono de opciones (hamburguesa)
              size={30}
              color={selectedButton === 'options' ? 'black' : "white"}
            />
          </Animated.View>
        </Pressable>

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <FontAwesome
            name="sign-out"
            size={30}
            color="white"
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

Navbar.propTypes = {
  onOptionsPress: PropTypes.func, // Definir el tipo de prop
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: '#E6C47F',  // Melocotón suave como color de fondo del área segura
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#C2A66B',
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#4B4E6D',  // Azul grisáceo oscuro para las sombras del navbar
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    marginHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  buttonContainer: {
    backgroundColor: '#4B4E6D',  // Mantener color consistente para los botones
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    shadowColor: '#2C3E50',  // Negro grisáceo oscuro para sombras de los botones
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  centerButton: {
    backgroundColor: '#4B4E6D',  // Color consistente para el botón central
    padding: 0,
    borderRadius: 30,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    position: 'relative',
    bottom: 0,
    shadowColor: '#4B4E6D',  // Sombra con azul grisáceo oscuro
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  selectedButton: {
    shadowColor: '#2C3E50',  // Negro grisáceo oscuro para sombras del botón seleccionado
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    backgroundColor: '#D4AF37',  // Dorado suave para el fondo del botón seleccionado
  },
  logoutButton: {
    backgroundColor: '#FF6347', // Rojo para indicar cerrar sesión
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    shadowColor: '#2C3E50',  // Negro grisáceo oscuro para sombras del botón
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    marginLeft: 10, // Espacio entre botones
  },
});
