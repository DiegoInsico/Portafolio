import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalEntry from '../screens/entrys/modalEntry';
import PropTypes from 'prop-types';

export default function Navbar({ navigation, onToggleSideBar }) {
  const [modalVisible, setModalVisible] = useState(false);

  // Refs para la escala animada de los botones
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleOptions = useRef(new Animated.Value(1)).current;

  // Función para manejar la animación y la selección de botones
  const handlePress = (scaleRef) => {
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 1.1, // Reducido a 1.1 para evitar un efecto exagerado
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Función para abrir el modal
  const handlePressAdd = () => {
    handlePress(scaleAdd);
    setModalVisible(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

      {modalVisible && <ModalEntry visible={modalVisible} onClose={handleCloseModal} />}

      <View style={styles.navbar}>
        {/* Botón de la Casa */}
        <Pressable
          onPressIn={() => handlePress(scaleHome)}
          onPressOut={() => navigation.navigate('Home')}
          style={({ pressed }) => [
            styles.buttonContainer,
            { backgroundColor: pressed ? '#3B3D53' : '#4B4E6D' }, // Cambio de color al presionar
          ]}
          accessible={true}
          accessibilityLabel="Ir a la página de inicio"
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleHome }] },
            ]}
          >
            <FontAwesome name="home" size={30} color="white" />
          </Animated.View>
        </Pressable>

        {/* Botón del Centro (Agregar) */}
        <Pressable
          onPress={handlePressAdd}
          style={({ pressed }) => [
            styles.centerButton,
            { backgroundColor: pressed ? '#3B3D53' : '#4B4E6D' }, // Cambio de color al presionar
          ]}
          accessible={true}
          accessibilityLabel="Agregar nueva entrada"
        >
          <Animated.View
            style={[
              styles.centerButton,
              { transform: [{ scale: scaleAdd }] },
            ]}
          >
            <FontAwesome name="plus" size={40} color="white" />
          </Animated.View>
        </Pressable>

        {/* Botón de Opciones (Sidebar) */}
        <Pressable
          onPressIn={() => handlePress(scaleOptions)}
          onPressOut={onToggleSideBar}
          style={({ pressed }) => [
            styles.buttonContainer,
            { backgroundColor: pressed ? '#3B3D53' : '#4B4E6D' }, // Cambio de color al presionar
          ]}
          accessible={true}
          accessibilityLabel="Abrir el menú"
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleOptions }] },
            ]}
          >
            <FontAwesome name="bars" size={30} color="white" />
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

Navbar.propTypes = {
  navigation: PropTypes.object.isRequired,
  onToggleSideBar: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
    backgroundColor: '#E6C47F',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#C2A66B',
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#4B4E6D',
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
    backgroundColor: '#4B4E6D',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    shadowColor: '#2C3E50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  centerButton: {
    backgroundColor: '#4B4E6D',
    padding: 0,
    borderRadius: 30,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    position: 'relative',
    bottom: 0,
    shadowColor: '#4B4E6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
