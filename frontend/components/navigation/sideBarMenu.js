import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import PropTypes from "prop-types";

export default function SideBarMenu({
  isVisible,
  toggleMenu,
  navigateToHome,
  navigateToListEntries,
  navigateToProfile,
  navigateToSettings,
  navigateToTestigos,
  navigateToBeneficiarios,
  navigateToProgramarMensaje,
  navigateToSoporte,
  handleSignOut,
}) {
  const slideAnim = new Animated.Value(-300); // Posición inicial fuera de la pantalla

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -300, // Se muestra o se esconde
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  if (!isVisible) return null; // No renderizar si no es visible

  return (
    <View style={styles.overlayContainer}>
      {/* Overlay oscuro para el fondo */}
      <TouchableWithoutFeedback onPress={toggleMenu}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Menú deslizante */}
      <Animated.View
        style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.headerText}>Menú</Text>
        </View>

        <View style={styles.menuContent}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToHome}>
            <FontAwesome name="home" size={24} color="#fff" />
            <Text style={styles.menuText}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToListEntries}>
            <FontAwesome name="tasks" size={24} color="#fff" />
            <Text style={styles.menuText}>Entradas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToProfile}>
            <FontAwesome name="user" size={24} color="#fff" />
            <Text style={styles.menuText}>Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToSettings}>
            <FontAwesome name="cog" size={24} color="#fff" />
            <Text style={styles.menuText}>Configuración</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToTestigos}>
            <FontAwesome name="users" size={24} color="#fff" />
            <Text style={styles.menuText}>Testigos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToBeneficiarios}
          >
            <FontAwesome name="heart" size={24} color="#fff" />
            <Text style={styles.menuText}>Beneficiarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={navigateToProgramarMensaje}
          >
            <FontAwesome name="clock-o" size={24} color="#fff" />
            <Text style={styles.menuText}>Programar Mensaje</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={navigateToSoporte}>
            <FontAwesome name="ticket" size={24} color="#fff" />
            <Text style={styles.menuText}>Soporte</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <FontAwesome name="sign-out" size={24} color="#fff" />
            <Text style={styles.menuText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

SideBarMenu.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  navigateToHome: PropTypes.func.isRequired,
  navigateToEntries: PropTypes.func.isRequired,
  navigateToProfile: PropTypes.func.isRequired,
  navigateToSettings: PropTypes.func.isRequired,
  navigateToTestigos: PropTypes.func.isRequired,
  navigateToBeneficiarios: PropTypes.func.isRequired,
  navigateToProgramarMensaje: PropTypes.func.isRequired,
  navigateToSoporte: PropTypes.func.isRequired,
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
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fondo oscuro y translúcido
  },
  menuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: "#1E1E2C",
    zIndex: 1001,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  menuHeader: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    color: "#FFD700",
    fontWeight: "bold",
  },
  menuContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    backgroundColor: "#2A2D3E",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
});
