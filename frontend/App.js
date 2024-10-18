import React, { useState, useRef, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { signOut } from "firebase/auth";

import Login from "./screens/auth/login";
import EntriesHome from "./screens/entrys/entriesHome";
import Registro from "./screens/auth/register";
import EditProfile from "./screens/profile/editProfile";
import RequestPasswordReset from "./screens/auth/resetPass";
import Home from "./screens/home/home";
import Baul from "./screens/chest/baul";
import SideBar from "./components/sideBar"; // Importamos el sidebar desde la carpeta de componentes
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Pantalla de carga mientras se verifica el estado de autenticación
function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#3B873E" />
    </View>
  );
}

// Función para configurar las pestañas de navegación (Bottom Tabs)
function MainTabs({ toggleSidebar }) {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'EntriesHome') {
            iconName = 'tasks';
          } else if (route.name === 'SideBar') {
            iconName = 'bars'; // Ícono de menú para abrir el SideBar
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D4AF37', // Color cuando el tab está activo
        tabBarInactiveTintColor: 'gray',  // Color cuando el tab está inactivo
        tabBarStyle: { backgroundColor: '#4B4E6D' }, // Estilo de la barra
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ title: 'Inicio' }} 
      />
      <Tab.Screen 
        name="EntriesHome" 
        component={EntriesHome} 
        options={{ title: 'Tus Entradas' }} 
      />
      
      {/* Botón para abrir el Sidebar */}
      <Tab.Screen
        name="SideBar"
        options={{ title: 'SideBar' }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            toggleSidebar(); // Llama a la función para abrir/cerrar el sidebar
          },
        }}
      />
    </Tab.Navigator>
  );
}

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

    return unsubscribe; // Limpia el listener al desmontar el componente
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
              <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
              <Stack.Screen name="Registro" component={Registro} options={{ headerShown: false }} />
              <Stack.Screen name="RequestPasswordReset" component={RequestPasswordReset} options={{ headerShown: false }} />
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
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
