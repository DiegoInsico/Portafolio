import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import SideBar from "./sideBar"; // Menú desplegable
import Home from "../../screens/home/home"; // Pantalla Home
import ListEntry from "../../screens/entrys/listEntry"; // Pantalla ListEntry

function AppNavigator({ navigation, user }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el SideBar (menú desplegable) */}
      <SideBar
        isVisible={sidebarVisible}
        toggleSidebar={handleToggleSidebar}
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
        handleSignOut={() => {
          handleToggleSidebar();
          console.log("Cerrando sesión...");
        }}
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
