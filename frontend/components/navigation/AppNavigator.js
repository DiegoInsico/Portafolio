// src/navigation/AppNavigator.js

import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, StyleSheet } from "react-native";

// Importar pantallas
import MainTabs from "./MainTabs";
import UserProfile from "../../screens/user/userProfile"; // Ruta corregida
import Testigos from "../../screens/user/Testigos";
import Beneficiarios from "../../screens/user/Beneficiarios";
import SettingsScreen from "../../screens/settings/SettingsScreen";
import SecuritySettings from "../../components/security/SecurittySettings"; // Asegúrate que el nombre del archivo sea correcto
import Login from "../../screens/auth/login";
import Registro from "../../screens/auth/register";
import RequestPasswordReset from "../../screens/auth/resetPass";
import ProgramarMensaje from "../../screens/entrys/ProgramarMensaje";
import Suscripcion from "../../screens/suscripcion/Suscripcion";
import Soporte from "../../screens/soporte/Soporte";
import CrearTicket from "../../screens/soporte/CrearTicket";
import ListaTickets from "../../screens/soporte/ListaTickets";
import DetalleTicket from "../../screens/soporte/DetalleTicket";
import SubirCertificado from "../../screens/user/SubirCertificado";
import ListEntry from "../../screens/entrys/ListEntry";
import { AuthContext } from "../../context/AuthContext";
import EntryScreen from "../../screens/entrys/EntryScreen";
import EntryDetailScreen from "../../screens/entrys/EntryDetailScreen";
import ReflexionListScreen from "../../screens/entrys/ReflexionListScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading, userData } = useContext(AuthContext);

  if (loading) {
    // Opcional: Retornar un SplashScreen o ActivityIndicator aquí
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerTransparent: true, // Header transparente
        headerBackground: () => (
          <Image
            source={require("../../assets/background/barra-superior.png")}
            style={styles.headerBackground}
            resizeMode="cover" // Evita que la imagen se estire
          />
        ),
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 20,
          color: "#FFD700", // Color que destaque
        },
        headerTintColor: "#FFD700", // Color de iconos (flecha de retroceso, etc.)
        headerTitleAlign: "center", // Alinear el título al centro
        headerStyle: {
          height: 90, // Reducir altura del header
          backgroundColor: "transparent",
          shadowColor: "transparent", // Eliminar sombra en iOS
          elevation: 0, // Eliminar sombra en Android
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
            name="Profile"
            component={UserProfile}
            options={{
              title: "Perfil",
            }}
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
            options={{
              title: "Configuración",
            }}
          />
          <Stack.Screen
            name="SecuritySettings"
            component={SecuritySettings} // Asegúrate que el nombre del archivo sea correcto
            options={{ title: "Configuración de Seguridad" }}
          />
          <Stack.Screen
            name="ProgramarMensaje"
            component={ProgramarMensaje}
            options={{ title: "Programar un Mensaje" }}
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
            component={CrearTicket}
            options={{ title: "Crear Ticket" }}
          />
          <Stack.Screen
            name="ListaTickets"
            component={ListaTickets}
            options={{ title: "Mis Tickets" }}
          />
          <Stack.Screen
            name="DetalleTicket"
            component={DetalleTicket}
            options={{ title: "Detalle del Ticket" }}
          />
          <Stack.Screen
            name="SubirCertificado"
            component={SubirCertificado}
            options={{ title: "Subir Certificado" }}
          />
          <Stack.Screen
            name="ListEntry"
            component={ListEntry}
            options={{
              title: "Listado de Instancias",
            }}
          />
          <Stack.Screen
            name="Entry"
            component={EntryScreen}
            options={{ title: "Instancias" }}
          />
          <Stack.Screen
            name="EntryDetailScreen"
            component={EntryDetailScreen}
            options={{ title: "Detalle" }}
          />
          <Stack.Screen
            name="ReflexionListScreen"
            component={ReflexionListScreen}
            options={{ title: "Reflexion List" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Registro"
            component={Registro}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RequestPasswordReset"
            component={RequestPasswordReset}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: "100%",
    height: 70, // Igual que headerStyle.height
  },
});
