import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Importar componentes
import SplashScreen from "./components/SplashScreen";
import MainTabs from "./components/MainTabs";
import SideBar from "./components/SideBar";

// Importar pantallas
import Login from "./screens/auth/login";
import Registro from "./screens/auth/register";
import RequestPasswordReset from "./screens/auth/resetPass";

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

    return unsubscribe; // Limpiar el listener
  }, [initializing]);

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <SideBar visible={sidebarVisible} toggleSidebar={toggleSidebar} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainTabs">
              {() => <MainTabs toggleSidebar={toggleSidebar} />}
            </Stack.Screen>
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
    
  },
});
