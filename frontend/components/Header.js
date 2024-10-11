import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable, SafeAreaView, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import ModalEntry from '../screens/entrys/modalEntry';

export default function Navbar() {
  const [modalVisible, setModalVisible] = useState(false);
  const handlePress = () => {
    setModalVisible(true); // Abrir el modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Cerrar el modal
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.navbar}>
        {/* Menú hamburguesa alineado a la derecha */}
        <Pressable style={styles.addButton} onPress={handlePress}>
          <FontAwesome name="plus" size={40} color="white" />
        </Pressable>

        {/* Icono de perfil centrado */}
        <View style={styles.inputContainer}>
          <Pressable style={styles.addButton} onPress={handlePress}>
            <FontAwesome name="plus" size={40} color="white" />
          </Pressable>
        </View>
        <ModalEntry
          visible={modalVisible}
          onClose={handleCloseModal}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 0, // Solo afecta el navbar, no toda la pantalla
    backgroundColor: '#ee684b', // Color de fondo del área segura
    paddingTop: StatusBar.currentHeight || 0, // Asegura espacio para la barra de estado
  },
  navbar: {
    height: 0, // Ajuste para la altura del navbar
    backgroundColor: '#ee684b', // Color del navbar
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Posición relativa para el perfil
  },
  inputContainer: {
    position: 'absolute',
    top: -50, // Este valor mueve el perfil hacia abajo para que sobresalga del navbar
    left: '50%',
    transform: [{ translateX: -40 }], // Centrar el perfil horizontalmente
    width: 80,
    height: 80,
    border: 10,
    borderColor: '#ee684b',
    borderRadius: 40, // Hace que el contenedor sea circular
    backgroundColor: '#C19A6B', // Fondo blanco detrás de la imagen
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Asegura que el perfil esté por encima del navbar
  },
  profileIcon: {
    width: 70,
    height: 70,
    borderRadius: 35, // Hace que la imagen sea circular
  },
  menuButton: {
    position: 'absolute',
    right: 20, // Alinea el botón de menú a la derecha
    top: -38, // Ajusta la posición vertical del botón de menú
  },
});
