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
  SafeAreaView, // Importar SafeAreaView
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
  navigateToSoporte, // Nueva función de navegación para Soporte
  handleSignOut
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
        <SafeAreaView style={styles.safeArea}>
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

            {/* Botones de Navegación Principales */}
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

            {/* Espaciador Flexible */}
            <View style={{ flex: 1 }} />

            {/* Línea de Separación Antes de los Elementos Inferiores */}
            <View style={styles.divider} />

            {/* Soporte (Posicionado al Final) */}
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
        </SafeAreaView>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente para superposición
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#d9d3c2", // Fondo principal en tono pastel suave
    zIndex: 999,
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    display: "flex",
    flexDirection: "column",
  },
  sidebarContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#dad7c9", // Borde en crema claro
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Efecto de sombra negra
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000", // Texto en negro
    textAlign: "center",
  },
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#dad7c9", // Fondo crema claro para los botones
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, // Efecto de sombra para los botones
  },
  drawerButtonText: {
    fontSize: 16,
    color: "#000000", // Texto en negro
    paddingLeft: 15,
  },
  selectedButton: {
    backgroundColor: "#dad7c9", // Fondo crema claro para el botón seleccionado
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderColor: "#FFFFFF",
    borderWidth: 1,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#dad7c9", // Línea divisoria en crema claro
    marginVertical: 15,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // Fondo transparente para superposición
  },
});
