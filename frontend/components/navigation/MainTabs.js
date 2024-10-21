// MainTabs.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import Sidebar from "./sideBar"; // Importar el componente Sidebar

// Importar pantallas
import Home from "../../screens/home/home";
import ListEntry from "../../screens/entrys/listEntry";
import Baul from "../../screens/chest/baul";
import UserProfile from "../../screens/user/userProfile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el Sidebar y pasar la función de navegación */}
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={handleToggleSidebar}
        navigateToBaul={() => {
          handleToggleSidebar();
          navigation.navigate("Baul");
        }}
        navigateToProfile={() => {
          handleToggleSidebar();
          navigation.navigate("Profile"); // Agregar la navegación al perfil
        }}
      />

      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'ListEntry') {
              iconName = 'tasks';
            } else if (route.name === 'SideBarButton') {
              iconName = 'bars';
            }
            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FFD700',
          tabBarInactiveTintColor: '#A9A9A9',
          tabBarStyle: {
            backgroundColor: '#2C3E50',
            borderTopWidth: 2,
            borderTopColor: '#D4AF37',
            height: 80,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen
          name="ListEntry"
          component={ListEntry}
          options={{
            title: 'Tus Entradas',
            headerStyle: { backgroundColor: '#fff' },
            headerTitleStyle: {
              borderBottomColor: '#D4AF37',
              fontWeight: "bold",
              fontSize: 20,
              color: "#333",
            },
          }}
        />
        <Tab.Screen
          name="SideBarButton"
          options={{ title: 'Menú' }}
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

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Baul"
        component={Baul}
        options={{
          title: 'Baúl',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: '#333',
          },
        }}
      />
      {/* Agregar la ruta para el perfil */}
      <Stack.Screen
        name="Profile"
        component={UserProfile} // Asegúrate de tener una pantalla de perfil
        options={{
          title: 'Perfil',
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
            color: '#333',
          },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: "transparent",
  },
});
