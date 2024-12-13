// src/navigation/RootNavigator.js

import React, { useState, useContext } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import SideBarMenu from "./sideBarMenu"; // Asegúrate de que la ruta es correcta
import { AuthContext } from "../../context/AuthContext";
import { signOutUser } from "../../utils/firebase";

// Importar tus pantallas
import MainTabs from "./MainTabs";
import UserProfile from "../../screens/user/userProfile";
import Testigos from "../../screens/user/Testigos";
import Beneficiarios from "../../screens/user/Beneficiarios";
import SettingsScreen from "../../screens/settings/SettingsScreen";
import SecuritySettings from "../security/SecurittySettings";
import LoginScreen from "../../screens/auth/login";
import RegisterScreen from "../../screens/auth/register";
import ResetPasswordScreen from "../../screens/auth/resetPass";
import ProgramarMensaje from "../../screens/entrys/ProgramarMensaje";
import Suscripcion from "../../screens/suscripcion/Suscripcion";
import Soporte from "../../screens/soporte/Soporte";
import CrearTicketScreen from "../../screens/soporte/CrearTicket";
import ListaTicketsScreen from "../../screens/soporte/ListaTickets";
import DetalleTicketScreen from "../../screens/soporte/DetalleTicket";
import SubirCertificado from "../../screens/user/SubirCertificado";
import ListEntry from "../../screens/entrys/ListEntry";
import EntryScreen from "../../screens/entrys/EntryScreen";
import EntryDetailScreen from "../../screens/entrys/EntryDetailScreen";
import ReflexionListScreen from "../../screens/entrys/ReflexionListScreen";
import MiDespedidaScreen from "../../screens/midespedida/MiDespedidaScreen"; // Importar la nueva pantalla

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { user, loading } = useContext(AuthContext);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  // Función para cerrar sesión
  const handleSignOutAndToggle = async () => {
    try {
      await signOutUser();
      handleToggleSidebar();
      // La navegación se manejará automáticamente mediante AuthContext
    } catch (error) {
      Alert.alert(
        "Error",
        "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo."
      );
    }
  };

  if (loading) {
    // Opcional: Puedes retornar un SplashScreen o ActivityIndicator aquí
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Renderizar el SideBar (menú desplegable) */}
      {user && (
        <SideBarMenu
          isVisible={sidebarVisible}
          toggleMenu={handleToggleSidebar}
          handleSignOut={handleSignOutAndToggle}
        />
      )}

      {/* Navegador de pila */}
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true,
          headerBackground: () => (
            <Image
              source={require("../../assets/background/barra-superior.png")}
              style={styles.headerBackground}
              resizeMode="cover"
            />
          ),
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 22,
            color: "#fff",
          },
          headerTintColor: "#fff",
          headerTitleAlign: "center",
          headerStyle: {
            height: 75,
            backgroundColor: "transparent",
            shadowColor: "transparent",
            elevation: 0,
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{ title: "Perfil" }}
            />
            <Stack.Screen
              name="Testigos"
              component={Testigos}
              options={{ title: "Testigos" }}
            />
            <Stack.Screen
              name="Beneficiarios"
              component={Beneficiarios}
              options={{ title: "Beneficiarios" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Configuración" }}
            />
            <Stack.Screen
              name="SecuritySettings"
              component={SecuritySettings}
              options={{ title: "Configuración de Seguridad" }}
            />
            <Stack.Screen
              name="ProgramarMensaje"
              component={ProgramarMensaje}
              options={{ title: "Un fragmento para ti" }}
            />
            <Stack.Screen
              name="Suscripcion"
              component={Suscripcion}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Soporte"
              component={Soporte}
              options={{ title: "Soporte" }}
            />
            <Stack.Screen
              name="CrearTicket"
              component={CrearTicketScreen}
              options={{ title: "Crear Ticket" }}
            />
            <Stack.Screen
              name="ListaTickets"
              component={ListaTicketsScreen}
              options={{ title: "Mis Tickets" }}
            />
            <Stack.Screen
              name="DetalleTicket"
              component={DetalleTicketScreen}
              options={{ title: "Detalle de Ticket" }}
            />
            <Stack.Screen
              name="SubirCertificado"
              component={SubirCertificado}
              options={{ title: "Subir Certificado" }}
            />
            <Stack.Screen
              name="ListEntry"
              component={ListEntry}
              options={{ title: "Listado de Instantes" }}
            />
            <Stack.Screen
              name="Entry"
              component={EntryScreen}
              options={{ title: "Instantes" }}
            />
            <Stack.Screen
              name="EntryDetailScreen"
              component={EntryDetailScreen}
              options={{ title: "Detalle" }}
            />
            <Stack.Screen
              name="ReflexionListScreen"
              component={ReflexionListScreen}
              options={{ title: "Reflexiones" }}
            />
            <Stack.Screen
              name="MiDespedida"
              component={MiDespedidaScreen}
              options={{ title: "Hasta Pronto" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2C", // Fondo oscuro
    position: "relative",
  },
  headerBackground: {
    width: "100%",
    height: 80, // Igual que headerStyle.height
  },
});
