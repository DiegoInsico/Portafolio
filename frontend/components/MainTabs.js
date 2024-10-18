import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Sidebar from "../components/SideBar"; // Importar el componente Sidebar

// Importar pantallas
import Home from "../screens/home/home";
import EntriesHome from "../screens/entrys/entriesHome";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el Sidebar */}
      <Sidebar isVisible={sidebarVisible} toggleSidebar={toggleSidebar} />

      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'EntriesHome') {
              iconName = 'tasks';
            } else if (route.name === 'SideBarButton') {
              iconName = 'bars';
            }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#4B4E6D' },
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
        <Tab.Screen
          name="SideBarButton"
          options={{ title: 'Menú' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              toggleSidebar(); // Abre/cierra el sidebar
            },
          }}
        >
          {() => null}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Cambia este color al que desees para el fondo
  },
});

