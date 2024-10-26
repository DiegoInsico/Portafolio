import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
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

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

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
        />

        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#4B4E6D",
            },
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
                name="ModalEntry"
                component={ModalEntry}
                options={{
                  headerShown: false,
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="Baul"
                component={Baul}
                options={{
                  title: "Baúl",
                  headerStyle: {
                    backgroundColor: "#FFD700",
                  },
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#333",
                  },
                }}
              />
              <Stack.Screen
                name="SecuritySettings"
                component={SecuritySettings} // Define esta pantalla en tu proyecto
                options={{
                  title: "Configuración de Seguridad",
                  headerStyle: {
                    backgroundColor: "#4B4E6D",
                  },
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 20,
                    color: "#FFD700",
                  },
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  headerShown: false,
                  title: "Iniciar Sesión",
                }}
              />
              <Stack.Screen
                name="Registro"
                component={Registro}
                options={{
                  headerShown: false,
                  title: "Registro",
                }}
              />
              <Stack.Screen
                name="RequestPasswordReset"
                component={RequestPasswordReset}
                options={{
                  headerShown: false,
                  title: "Restablecer Contraseña",
                }}
              />
            </>
          )}
        </Stack.Navigator>
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
