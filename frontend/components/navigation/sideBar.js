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
import { auth } from "../../utils/firebase";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function SideBar({ isVisible, toggleSidebar, navigateToBaul, navigateToProfile, navigateToSecuritySettings }) {
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
      toggleSidebar(); // Asegúrate de usar toggleSidebar aquí también
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <TouchableWithoutFeedback onPress={toggleSidebar}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[styles.sidebarContainer, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sidebarContent}>
          {/* Sección de perfil */}
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: "https://www.example.com/profile-pic.jpg" }} // Reemplaza con tu imagen
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Nombre del Usuario</Text>
          </View>

          {/* Línea divisoria entre perfil y botones */}
          <View style={styles.divider} />

          {/* Opción de Perfil */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Perfil" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Perfil");
              navigateToProfile(); // Navegar hacia la pantalla de perfil
              toggleSidebar(); // Cierra el sidebar al navegar
            }}
          >
            <FontAwesome
              name="user"
              size={20}
              color={selected === "Perfil" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Perfil </Text>
          </TouchableOpacity>

          {/* Opción del Baúl */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Baul" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Baul");
              navigateToBaul(); // Navegar hacia la pantalla Baul
              toggleSidebar(); // Cierra el sidebar al navegar
            }}
          >
            <FontAwesome
              name="archive"
              size={20}
              color={selected === "Baul" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}>Baúl </Text>
          </TouchableOpacity>

          {/* Opción de Configuración de Seguridad */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "ConfiguracionSeguridad" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("ConfiguracionSeguridad");
              navigateToSecuritySettings(); // Navegar hacia la configuración de seguridad
              toggleSidebar(); // Cierra el sidebar al navegar
            }}
          >
            <FontAwesome
              name="lock"
              size={20}
              color={selected === "ConfiguracionSeguridad" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}> Seguridad </Text>
          </TouchableOpacity>

          {/* Opción de Cerrar Sesión */}
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
                { color: selected === "Cerrar Sesión" ? "#FFD700" : "#fff" },
              ]}
            >Cerrar Sesión </Text>
          </TouchableOpacity>
        </View>

        {/* Footer al final del sidebar */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Soy - En Desarrollo</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo más oscuro para mayor enfoque
    zIndex: 998,
  },
  sidebarContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280, // Ancho más amplio para mayor espacio
    backgroundColor: "#2C3E50", // Color de fondo más oscuro y elegante
    zIndex: 999,
    paddingTop: 50,
    paddingLeft: 20,
    paddingRight: 20, // Agrega padding derecho para evitar que el texto quede pegado
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5, // Sombra pronunciada para dar un efecto de flotación
    elevation: 10,
    borderTopLeftRadius: 20, // Bordes redondeados
    borderBottomLeftRadius: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 10, // Reducido para ajustar el espacio con la línea divisoria
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFD700", // Borde dorado alrededor de la imagen
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#FFD700", // Color dorado para el nombre
    textAlign: "center",
  },
  drawerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#34495E", // Fondo oscuro para los botones
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  drawerButtonText: {
    fontSize: 16,
    color: "#fff", // Blanco para que el texto contraste con el fondo
    paddingLeft: 15,
  },
  sidebarContent: {
    flex: 1,
  },
  selectedButton: {
    backgroundColor: "#FFD700", // Color dorado para la selección activa
    shadowColor: "#FFD700", // Sombra dorada
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#FFD700", // Color dorado para la línea divisoria
    marginVertical: 15, // Espacio entre la línea y las secciones
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Espacio en la parte inferior
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc', // Borde superior para separar el footer
  },
  footerText: {
    fontSize: 14,
    color: '#FFD700', // Color dorado para el texto del footer
    fontStyle: 'italic',
  },
});
