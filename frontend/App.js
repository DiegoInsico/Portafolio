// App.js

import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Linking, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "./components/ui/SplashScreen";
import AppNavigator from "./components/navigation/AppNavigator";

import { AuthProvider, AuthContext } from "./context/AuthContext"; // Importar AuthContext

// Importar Provider de React Native Paper
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// Definir un tema personalizado si lo deseas
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3498DB', // Cambia esto según tu paleta de colores
    accent: '#FFD700',  // Cambia esto según tu paleta de colores
  },
};

const Main = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { loading } = useContext(AuthContext);

  const openModalEntry = () => {
    setModalVisible(true);
  };

  const closeModalEntry = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    const handleOpenURL = (event) => {
      const url = event.url || "";
      if (url.includes("shortcut=crearEntrada")) {
        openModalEntry();
      }
    };

    // React Native 0.65 y posteriores usan addListener en lugar de addEventListener
    Linking.addListener("url", handleOpenURL);

    Linking.getInitialURL().then((url) => {
      if (url && url.includes("shortcut=crearEntrada")) {
        openModalEntry();
      }
    });

    return () => {
      // Eliminar correctamente el listener usando removeListener
      Linking.removeListener("url", handleOpenURL);
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      <AppNavigator />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      {/* Envolver con PaperProvider */}
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Main />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
