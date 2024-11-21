import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import SideBar from "./SideBar";

// Importar pantallas
import Home from "../../screens/home/home";
import ListEntry from "../../screens/entrys/ListEntry";

const Tab = createBottomTabNavigator();

function MainTabs({ navigation, user }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el SideBar con el objeto 'user' */}
      <SideBar
        isVisible={sidebarVisible}
        toggleSidebar={handleToggleSidebar}
        navigateToProfile={() => {
          handleToggleSidebar();
          navigation.navigate("Profile");
        }}
        navigateToSettings={() => {
          handleToggleSidebar();
          navigation.navigate("Settings");
        }}
        navigateToTestigos={() => {
          handleToggleSidebar();
          navigation.navigate("Testigos");
        }}
        navigateToBeneficiarios={() => {
          handleToggleSidebar();
          navigation.navigate("Beneficiarios");
        }}
        navigateToProgramarMensaje={() => {
          handleToggleSidebar();
          navigation.navigate("ProgramarMensaje");
        }}
        navigateToSoporte={() => {
          handleToggleSidebar();
          navigation.navigate("Soporte");
        }}
        navigateToSubirCertificado={() => {
          handleToggleSidebar();
          navigation.navigate("SubirCertificado");
        }}
        user={user} // Pasar 'user' como prop
      />

      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "ListEntry") {
              iconName = "tasks";
            } else if (route.name === "SideBarButton") {
              iconName = "bars";
            }

            // Cambiar tamaño de icono si está enfocado
            size = focused ? 28 : 24;

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#f0a500",
          tabBarInactiveTintColor: "#b0b0b0",
          tabBarStyle: styles.tabBarStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle,
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            title: "Inicio",
          }}
        />
        <Tab.Screen
          name="ListEntry"
          options={{
            title: "Entradas",
          }}
        >
          {() => <ListEntry user={user} />}
        </Tab.Screen>
        <Tab.Screen
          name="SideBarButton"
          options={{ title: "Menú" }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleToggleSidebar();
            },
          }}
        >
          {() => null}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

export default MainTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E2C", // Fondo oscuro para que combine con la barra
    position: "relative",
  },
  tabBarStyle: {
    backgroundColor: "#1E1E2C",
    height: 70,
    borderRadius: 35, // Redondear completamente la barra
    marginHorizontal: 5, // Separación de los bordes laterales
    marginBottom: 5, // Separación del borde inferior
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.5,
    elevation: 8, // Efecto flotante
    zIndex: 10, // Asegura que esté al frente
    position: "absolute", // Posición absoluta para flotar
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
