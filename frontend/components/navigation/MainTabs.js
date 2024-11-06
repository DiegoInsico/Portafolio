// MainTabs.js

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
          navigation.navigate("ProgramarMensaje")
        }}
        user={user} // Pasar 'user' como prop
      />

      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "ListEntry") {
              iconName = "tasks";
            } else if (route.name === "SideBarButton") {
              iconName = "bars";
            }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#dbcd0f",
          tabBarInactiveTintColor: "#A9A9A9",
          tabBarStyle: {
            backgroundColor: "#2C3E50",
            height: 70,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderTopWidth: 0,
            position: "absolute",
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "bold",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            title: "Home",
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
    backgroundColor: "transparent",
    position: "relative",
  },
});
