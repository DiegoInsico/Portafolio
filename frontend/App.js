import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Linking, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Importar componentes
import SplashScreen from "./components/ui/SplashScreen";
import MainTabs from "./components/navigation/MainTabs";
import SideBar from "./components/navigation/sideBar";

// Importar pantallas
import Login from "./screens/auth/login";
import Registro from "./screens/auth/register";
import RequestPasswordReset from "./screens/auth/resetPass";
import ModalEntry from "./screens/entrys/modalEntry";
import Baul from "./screens/chest/baul";
import SecuritySettings from "./components/security/SecurittySettings";
import SettingsScreen from "./screens/settings/SettingsScreen";

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const openModalEntry = () => {
    setModalVisible(true);
  };

  const closeModalEntry = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  useEffect(() => {
    const handleOpenURL = (event) => {
      const url = event.url || "";
      if (url.includes("shortcut=crearEntrada")) {
        openModalEntry();
      }
    };
  
    Linking.addEventListener("url", handleOpenURL);
  
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("shortcut=crearEntrada")) {
        openModalEntry();
      }
    });
  
    // Cambia removeEventListener por remove
    return () => {
      Linking.remove("url", handleOpenURL);
    };
  }, []);
  

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <SideBar
          isVisible={sidebarVisible}
          toggleSidebar={toggleSidebar}
          navigateToBaul={() => {
            toggleSidebar();
            navigation.navigate("Baul");
          }}
          navigateToProfile={() => {
            toggleSidebar();
            navigation.navigate("Profile");
          }}
          navigateToSecuritySettings={() => {
            toggleSidebar();
            navigation.navigate("Configuración de Seguridad");
          }}
          navigateToSettings={() => {
            toggleSidebar();
            navigation.navigate("Settings");
          }}
        />

        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#4B4E6D" },
            headerTintColor: "#000000",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerTitle: () => (
              <Image
                source={require("./assets/background/florLogo.png")}
                style={{ width: 100, height: 40, resizeMode: "contain" }}
              />
            ),
            headerBackground: () => (
              <Image
                source={require("./assets/background/navbar.png")}
                style={{ width: "100%", height: "100%" }}
              />
            ),
            ...TransitionPresets.SlideFromRightIOS,
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
                {() => <MainTabs toggleSidebar={toggleSidebar} />}
              </Stack.Screen>
              <Stack.Screen
                name="Baul"
                component={Baul}
                options={{
                  title: "Baúl",
                  headerStyle: { backgroundColor: "#FFD700" },
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#333",
                  },
                }}
              />
              <Stack.Screen
                name="SecuritySettings"
                component={SecuritySettings}
                options={{
                  title: "Configuración de Seguridad",
                  headerStyle: { backgroundColor: "#4B4E6D" },
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#FFD700",
                  },
                }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  title: "Configuración",
                  headerStyle: { backgroundColor: "#2C3E50" },
                  headerTintColor: "#FFD700",
                  headerTitleStyle: { fontWeight: "bold" },
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false, title: "Iniciar Sesión" }}
              />
              <Stack.Screen
                name="Registro"
                component={Registro}
                options={{ headerShown: false, title: "Registro" }}
              />
              <Stack.Screen
                name="RequestPasswordReset"
                component={RequestPasswordReset}
                options={{ headerShown: false, title: "Restablecer Contraseña" }}
              />
            </>
          )}
        </Stack.Navigator>

        <ModalEntry visible={modalVisible} onClose={closeModalEntry} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
