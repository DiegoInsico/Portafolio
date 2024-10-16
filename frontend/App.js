import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/auth/login";
import EntriesHome from "./screens/entrys/entriesHome";
import Registro from "./screens/auth/register";
import EditProfile from "./screens/profile/editProfile";
import RequestPasswordReset from "./screens/auth/resetPass";
import Home from "./screens/home/home";
import Baul from "./screens/chest/baul";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();

// Pantalla de carga mientras se verifica el estado de autenticación
function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#3B873E" />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe; // Limpia el listener al desmontar el componente
  }, [initializing]);

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="EntriesHome"
                component={EntriesHome}
                options={{ title: "Tus Entradas" }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfile}
                options={{ title: "EditProfile" }}
              />
                <Stack.Screen
                name="Baul"
                component={Baul}
                options={{ title: "Baul" }}
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
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0, // Añade un espacio para que el contenido no se solape con el navbar
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
