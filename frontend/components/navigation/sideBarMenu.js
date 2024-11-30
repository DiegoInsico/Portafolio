// src/navigation/SideBarMenu.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import { getAuth } from "firebase/auth"; // Importar getAuth
import { useNavigation } from "@react-navigation/native"; // Importar useNavigation

const SideBarMenu = ({
  isVisible,
  toggleMenu,
  handleSignOut,
}) => {
  const slideAnim = new Animated.Value(-300); // Posición inicial fuera de la pantalla
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation(); // Usar el hook useNavigation

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [isVisible]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -300, // Se muestra o se esconde
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!isVisible) return null; // No renderizar si no es visible

  // Función para manejar la navegación y cerrar la sidebar
  const handleNavigation = (screenName) => {
    toggleMenu();
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.overlayContainer}>
      {/* Overlay oscuro para el fondo */}
      <TouchableWithoutFeedback onPress={toggleMenu}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Menú deslizante */}
      <Animated.View
        style={[
          styles.menuContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Perfil del usuario */}
        {userData && (
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.profileImage}
              resizeMode="cover"
            />
            <Text style={styles.userName}>{userData.displayName}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
          </View>
        )}

        {/* Opciones del menú */}
        <View style={styles.menuContent}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("MainTabs")}
          >
            <FontAwesome name="home" size={24} color="#000" />
            <Text style={styles.menuText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("ListEntry")}
          >
            <FontAwesome name="tasks" size={24} color="#000" />
            <Text style={styles.menuText}>Entradas</Text>
          </TouchableOpacity>

          {/* Nueva opción de "Mi Despedida" */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("MiDespedida")}
          >
            <FontAwesome name="video-camera" size={24} color="#000" />
            <Text style={styles.menuText}>Mi Despedida</Text>
          </TouchableOpacity>

          {/* Línea divisoria */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("UserProfile")}
          >
            <FontAwesome name="user" size={24} color="#000" />
            <Text style={styles.menuText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Testigos")}
          >
            <FontAwesome name="users" size={24} color="#000" />
            <Text style={styles.menuText}>Testigos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Beneficiarios")}
          >
            <FontAwesome name="heart" size={24} color="#000" />
            <Text style={styles.menuText}>Beneficiarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("ProgramarMensaje")}
          >
            <FontAwesome name="clock-o" size={24} color="#000" />
            <Text style={styles.menuText}>Programar Mensaje</Text>
          </TouchableOpacity>

          {/* Línea divisoria */}
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Settings")}
          >
            <FontAwesome name="cog" size={24} color="#000" />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleNavigation("Soporte")}
          >
            <FontAwesome name="ticket" size={24} color="#000" />
            <Text style={styles.menuText}>Soporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              toggleMenu();
              handleSignOut();
            }}
          >
            <FontAwesome name="sign-out" size={24} color="#000" />
            <Text style={styles.menuText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

SideBarMenu.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  handleSignOut: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Fondo translúcido más claro
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF", // Fondo blanco
    zIndex: 1001,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  userEmail: {
    fontSize: 14,
    color: "#888",
  },
  menuContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#F9F9F9", // Fondo gris claro
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#000", // Texto negro
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0", // Color gris claro
    marginVertical: 10,
    width: "100%", // Ajusta al ancho del contenedor
  },
});

export default SideBarMenu;
