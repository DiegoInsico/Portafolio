// App.js

import React, { useState, useEffect, useContext } from "react";
import { View, StyleSheet, Linking, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "./components/ui/SplashScreen";
import AppNavigator from "./components/navigation/AppNavigator";

import ModalEntry from "./screens/entrys/modalEntry";

import { AuthProvider, AuthContext } from "./context/AuthContext"; // Importar AuthContext

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

    const subscription = Linking.addEventListener("url", handleOpenURL);

    Linking.getInitialURL().then((url) => {
      if (url && url.includes("shortcut=crearEntrada")) {
        openModalEntry();
      }
    });

    return () => {
      // Eliminar correctamente el listener
      subscription.remove();
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      <AppNavigator />
      <ModalEntry visible={modalVisible} onClose={closeModalEntry} />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Main />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
