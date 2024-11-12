// components/SideBar.js

import React, { useRef, useEffect, useState, useContext } from "react";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../../utils/firebase"; // Asegúrate de que la ruta sea correcta
import FontAwesome from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";
import { AuthContext } from "../../context/AuthContext"; // Importar el contexto

export default function SideBar({
  isVisible,
  toggleSidebar,
  navigateToProfile,
  navigateToSettings,
  navigateToTestigos,
  navigateToBeneficiarios,
  navigateToProgramarMensaje,
  navigateToSoporte, // Nueva función de navegación
}) {
  const { user, userData, loading } = useContext(AuthContext);
  const [selected, setSelected] = useState("");
  const slideAnim = useRef(new Animated.Value(280)).current; // Ajustar según el ancho del sidebar

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 280, // Mover completamente fuera de la pantalla
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setSelected("");
      });
    }
  }, [isVisible]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toggleSidebar();
      Alert.alert("Éxito", "Has cerrado sesión correctamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión.");
    }
  };

  if (loading) {
    return (
      <Animated.View
        style={[
          styles.container,
          { pointerEvents: isVisible ? "auto" : "none" },
        ]}
      >
        {/* Mostrar overlay solo si el sidebar está visible */}
        {isVisible && (
          <TouchableWithoutFeedback onPress={toggleSidebar}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        <Animated.View
          style={[
            styles.sidebarContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={styles.sidebarContent}>
            {/* Perfil */}
            <View style={styles.profileContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
            </View>

            <View style={styles.divider} />

            {/* Botones de Navegación */}
            {/* Puedes mantener los botones deshabilitados mientras se carga */}
          </View>
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.container, { pointerEvents: isVisible ? "auto" : "none" }]}
    >
      {/* Mostrar overlay solo si el sidebar está visible */}
      {isVisible && (
        <TouchableWithoutFeedback onPress={toggleSidebar}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View
        style={[
          styles.sidebarContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.sidebarContent}>
          {/* Perfil */}
          <View style={styles.profileContainer}>
            <Image
              source={
                user && user.photoURL
                  ? { uri: user.photoURL }
                  : userData && userData.photoURL
                  ? { uri: userData.photoURL }
                  : require("../../assets/default-profile.png") // Asegúrate de que la ruta sea correcta
              }
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>
              {user && user.displayName
                ? user.displayName
                : user && user.email
                ? user.email
                : "Nombre del Usuario"}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Botones de Navegación */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Perfil" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Perfil");
              navigateToProfile();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="user"
              size={20}
              color={selected === "Perfil" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Testigos" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Testigos");
              navigateToTestigos();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="users"
              size={20}
              color={selected === "Testigos" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Testigos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "ProgramarMensaje" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("ProgramarMensaje");
              navigateToProgramarMensaje();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="clock-o"
              size={20}
              color={selected === "ProgramarMensaje" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Programar Mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Beneficiarios" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Beneficiarios");
              navigateToBeneficiarios();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="heart"
              size={20}
              color={selected === "Beneficiarios" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Beneficiarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Configuracion" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Configuracion");
              navigateToSettings();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="cog"
              size={20}
              color={selected === "Configuracion" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Configuración</Text>
          </TouchableOpacity>

          {/* Soporte */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Soporte" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Soporte");
              navigateToSoporte(); // Función de navegación a Soporte
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="ticket"
              size={20}
              color={selected === "Soporte" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Soporte</Text>
          </TouchableOpacity>

          {/* Cerrar Sesión */}
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
              color={selected === "Cerrar Sesión" ? "#FFD700" : "#fff"}
            />
            <Text
              style={[
                styles.drawerButtonText,
                {
                  color: selected === "Cerrar Sesión" ? "#FFD700" : "#fff",
                },
              ]}
            >
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

SideBar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  navigateToProfile: PropTypes.func.isRequired,
  navigateToSettings: PropTypes.func.isRequired,
  navigateToTestigos: PropTypes.func.isRequired,
  navigateToBeneficiarios: PropTypes.func.isRequired,
  navigateToProgramarMensaje: PropTypes.func.isRequired,
  navigateToSoporte: PropTypes.func.isRequired, // Añadir PropType para Soporte
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#2C3E50",
    zIndex: 999,
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 10,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  sidebarContent: {
    flex: 1,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFD700",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
  },
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#34495E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  drawerButtonText: {
    fontSize: 16,
    color: "#fff",
    paddingLeft: 15,
  },
  selectedButton: {
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
    borderColor: "#FFFFFF",
    borderWidth: 1,
  },
  selectedButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#FFD700",
    marginVertical: 15,
  },
});
