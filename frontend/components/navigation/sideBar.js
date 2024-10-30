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
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebase";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function SideBar({
  isVisible,
  toggleSidebar,
  navigateToBaul,
  navigateToProfile,
}) {
  const navigation = useNavigation(); // Hook de navegación
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
      setSelected("");
    }
  }, [isVisible]);

  if (!isVisible) return null; // Si el sidebar no es visible, no renderizar nada

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toggleSidebar();
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
        style={[
          styles.sidebarContainer,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <View style={styles.sidebarContent}>
          <View style={styles.profileContainer}>
            <Image
              source={{ uri: "https://www.example.com/profile-pic.jpg" }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Nombre del Usuario</Text>
          </View>

          <View style={styles.divider} />

          {/* Opción de Perfil */}
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
            <Text style={styles.drawerButtonText}> Perfil</Text>
          </TouchableOpacity>

          {/* Opción del Baúl */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Baul" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Baul");
              navigateToBaul();
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="archive"
              size={20}
              color={selected === "Baul" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}> Baúl</Text>
          </TouchableOpacity>

          {/* Opción de Crear Mensaje */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "CrearMensaje" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("CrearMensaje");
              navigation.navigate("CrearMensaje"); // Navegar directamente
              toggleSidebar();
            }}
          >
            <FontAwesome name="envelope" size={24} color="#FFFFFF" />
            <Text style={styles.drawerButtonText}> Crear un mensaje</Text>
          </TouchableOpacity>

          {/* Opción de Configuraciones */}
          <TouchableOpacity
            style={[
              styles.drawerButton,
              selected === "Configuraciones" && styles.selectedButton,
            ]}
            onPress={() => {
              setSelected("Configuraciones");
              toggleSidebar();
            }}
          >
            <FontAwesome
              name="cog"
              size={20}
              color={selected === "Configuraciones" ? "#FFD700" : "#fff"}
            />
            <Text style={styles.drawerButtonText}> Configuraciones</Text>
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
            >
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

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
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
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
  sidebarContent: {
    flex: 1,
  },
  selectedButton: {
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#FFD700",
    marginVertical: 15,
  },
  footer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  footerText: {
    fontSize: 14,
    color: "#FFD700",
    fontStyle: "italic",
  },
});
