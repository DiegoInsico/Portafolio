import React, { useRef, useEffect, useState } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function SideBar({ isVisible, toggleSideBar, navigateToBaul }) {
  const [selected, setSelected] = useState(""); // Estado para la opción seleccionada
  const slideAnim = useRef(new Animated.Value(250)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 250,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Restablece la selección cuando el sidebar se cierra
      setSelected(""); 
    }
  }, [isVisible]);

  if (!isVisible) return null; // Si el sidebar no es visible, no renderizar nada

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toggleSideBar();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableWithoutFeedback onPress={toggleSideBar}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sidebarContent}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: "https://www.example.com/profile-pic.jpg" }} // Reemplaza con tu imagen
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Nombre del Usuario</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Baul" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Baul");
              navigateToBaul(); // Navegar hacia la pantalla Baul
              toggleSideBar(); // Cierra el sidebar al navegar
            }}
          >
            <FontAwesome
              name="archive"
              size={20}
              color={selected === "Baul" ? "#D4AF37" : "#000"}
            />
            <Text style={styles.drawerButtonText}> Baúl</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Configuraciones" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Configuraciones");
              toggleSideBar();
            }}
          >
            <FontAwesome
              name="cog"
              size={20}
              color={selected === "Configuraciones" ? "#D4AF37" : "#000"}
            />
            <Text style={styles.drawerButtonText}> Configuraciones</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Cerrar Sesión" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Cerrar Sesión");
              handleSignOut();
            }}
          >
            <FontAwesome
              name="sign-out"
              size={20}
              color={selected === "Cerrar Sesión" ? "#d9534f" : "#000"}
            />
            <Text
              style={[
                styles.drawerButtonText,
                { color: selected === "Cerrar Sesión" ? "#d9534f" : "#000" },
              ]}
            >
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    zIndex: 999,
    paddingTop: 50,
    paddingLeft: 10,
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    margin: 4,
    padding: 2,
  },
  drawerButtonText: {
    fontSize: 16,
    color: "#000",
    paddingLeft: 3,
  },
  sidebarContent: {
    flex: 1,
  },
  closeButton: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 18,
  },
  menuItem: {
    color: "#fff",
    marginBottom: 20,
    fontSize: 16,
  },
  selectedButton: {
    backgroundColor: "#f0f0f0",
  },
});
