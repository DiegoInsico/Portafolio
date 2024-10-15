import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  Animated,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import PropTypes from "prop-types";
import ModalEntry from "../screens/entrys/modalEntry"; // Importa tu ModalEntry
import SideBar from "./sideBar";

export default function Navbar({ onOptionsPress }) {
  const navigation = useNavigation();

  // Estado para controlar la visibilidad del ModalEntry
  const [modalVisible, setModalVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Controla la visibilidad del SideBar

  // Refs para la escala animada de los botones
  const scaleHome = useRef(new Animated.Value(1)).current;
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleOptions = useRef(new Animated.Value(1)).current;

  // Función para manejar la animación de los botones
  const handlePress = (scaleRef) => {
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 1.1,
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
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Función para abrir y cerrar el SideBar
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <SideBar visible={sidebarVisible} onClose={toggleSidebar} />

      <View style={styles.navbarContainer}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View style={styles.navbar}>
          {/* Botón de Home - Navegar a Home */}
          <Pressable onPress={() => navigation.navigate("Home")}>
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleHome }] },
              ]}
            >
              <FontAwesome name="home" size={30} color="black" />
            </Animated.View>
          </Pressable>

          {/* Botón de Agregar - Navegar a EntriesHome */}
          <Pressable onPress={() => navigation.navigate("EntriesHome")}>
            <Animated.View
              style={[
                styles.centerButton,
                { transform: [{ scale: scaleAdd }] },
              ]}
            >
              <FontAwesome name="tasks" size={30} color="black" />
            </Animated.View>
          </Pressable>

          {/* Botón de Opciones (abrir Sidebar) */}
          <Pressable onPress={toggleSidebar}>
            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleOptions }] },
              ]}
            >
              <FontAwesome name="user" size={30} color="black" />
            </Animated.View>
          </Pressable>
        </View>

        {/* Modal para crear una nueva entrada */}
        <ModalEntry visible={modalVisible} onClose={closeModal} />
      </View>
    </>
  );
}

Navbar.propTypes = {
  onOptionsPress: PropTypes.func,
};

const styles = StyleSheet.create({
  navbarContainer: {
    flex: 1,
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#D4AF37",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#D4AF37",
    paddingVertical: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: 80,
    shadowColor: "#4B4E6D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  buttonContainer: {
    backgroundColor: "#4B4E6D",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  centerButton: {
    backgroundColor: "#4B4E6D",
    borderRadius: 25,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    height: 60,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    borderRadius: 25,
    width: 60,
    height: 60,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
