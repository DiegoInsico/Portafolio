// App.js

import React, { useEffect, useContext } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "./components/ui/SplashScreen";
import AppNavigator from "./components/navigation/AppNavigator";

import { AuthProvider, AuthContext } from "./context/AuthContext"; // Importar AuthContext

// Importar Provider de React Native Paper
import { Provider as PaperProvider, DefaultTheme } from "react-native-paper";

// Definir un tema personalizado si lo deseas
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#3498DB", // Cambia esto según tu paleta de colores
    accent: "#FFD700", // Cambia esto según tu paleta de colores
  },
};

const Main = ({ navigation }) => {
  const { loading } = useContext(AuthContext);

  useEffect(() => {
    const handleOpenURL = (event) => {
      const url = event.url || "";
      console.log("URL recibida:", url); // Añade logs para depuración
      if (url.includes("shortcut=crearEntrada")) {
        // Implementa la lógica para abrir el modal o navegar a la pantalla correspondiente
        navigation.navigate("CrearEntrada");
      }
    };

    // Añadir listener para manejar URLs
    const subscription = Linking.addEventListener("url", handleOpenURL);

    // Verificar la URL inicial si la app se abre mediante un enlace
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("shortcut=crearEntrada")) {
        navigation.navigate("CrearEntrada");
      }
    });

    return () => {
      // Remover el listener al desmontar el componente
      subscription.remove();
    };
  }, [navigation]);

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
