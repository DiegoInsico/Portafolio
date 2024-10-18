// ./components/sideBar.js
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, TouchableWithoutFeedback } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const { width } = Dimensions.get('window');

export default function SideBar({ visible, toggleSidebar }) {
  const slideAnim = useRef(new Animated.Value(-width * 0.75)).current; // Inicialmente fuera de la pantalla

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toggleSidebar(); // Cerrar sidebar al cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={toggleSidebar}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: "https://www.example.com/profile-pic.jpg" }} style={styles.profileImage} />
            <Text style={styles.profileName}>Nombre del Usuario</Text>
          </View>
          <TouchableOpacity style={styles.drawerButton} onPress={toggleSidebar}>
            <Text style={styles.drawerButtonText}>Baul</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerButton} onPress={toggleSidebar}>
            <Text style={styles.drawerButtonText}>Configuraciones</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerButton} onPress={handleSignOut}>
            <Text style={[styles.drawerButtonText, { color: "#d9534f" }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    width: width * 0.75, // Sidebar cubre el 75% del ancho de la pantalla
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 2,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerButton: {
    paddingVertical: 15,
  },
  drawerButtonText: {
    fontSize: 16,
    color: "#000",
  },
});
