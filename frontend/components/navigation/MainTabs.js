// AppNavigator.js

import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import SideBar from "./sideBarMenu"; // Asegúrate de que la ruta sea correcta
import Home from "../../screens/home/home"; // Pantalla Home
import ListEntry from "../../screens/entrys/ListEntry"; // Pantalla ListEntry
import { getAuth } from "firebase/auth";

function AppNavigator({ navigation, user }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await auth.signOut();
      // Navegar a la pantalla de inicio de sesión después de cerrar sesión
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      console.log("Usuario ha cerrado sesión exitosamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.");
    }
  };

  // Función que se pasará al SideBar para manejar el cierre de sesión
  const handleSignOutAndToggle = () => {
    handleToggleSidebar(); // Cierra el menú lateral
    handleSignOut();       // Realiza el cierre de sesión
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el SideBar (menú desplegable) */}
      <SideBar
        isVisible={sidebarVisible}
        toggleMenu={handleToggleSidebar}
        navigateToHome={() => {
          handleToggleSidebar();
          navigation.navigate("Home");
        }}
        navigateToEntries={() => {
          handleToggleSidebar();
          navigation.navigate("ListEntry");
        }}
        navigateToProfile={() => {
          handleToggleSidebar();
          navigation.navigate("Profile");
        }}
        navigateToSettings={() => {
          handleToggleSidebar();
          navigation.navigate("Settings");
        }}
        navigateToTestigos={() => {
          handleToggleSidebar();
          navigation.navigate("Testigos");
        }}
        navigateToBeneficiarios={() => {
          handleToggleSidebar();
          navigation.navigate("Beneficiarios");
        }}
        navigateToProgramarMensaje={() => {
          handleToggleSidebar();
          navigation.navigate("ProgramarMensaje");
        }}
        navigateToSoporte={() => {
          handleToggleSidebar();
          navigation.navigate("Soporte");
        }}
        navigateToEntryDetail={() => {
          handleToggleSidebar();
          navigation.navigate("Detalle");
        }}
        navigateToMiDespedida={() => {
          handleToggleSidebar();
          navigation.navigate("MiDespedida");
        }}
        
        handleSignOut={handleSignOutAndToggle} // Pasar la función correcta
        user={user}
      />

      {/* Contenido principal: Inicializa con la pantalla Home */}
      <View style={styles.content}>
        <Home navigation={navigation} />
      </View>
    </View>
  );
}

export default AppNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2C", // Fondo oscuro
    position: "relative",
  },
  content: {
    flex: 1,
  },
});
