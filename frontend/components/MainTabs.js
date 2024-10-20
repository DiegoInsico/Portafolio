// MainTabs.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Sidebar from "../components/SideBar"; // Importar el componente Sidebar

// Importar pantallas
import Home from "../screens/home/home";
import EntriesHome from "../screens/entrys/entriesHome";
import Baul from "../screens/chest/baul";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs({ navigation }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <View style={styles.container}>
      {/* Renderizar el Sidebar y pasar la función de navegación */}
      <Sidebar
        isVisible={sidebarVisible}
        toggleSidebar={toggleSidebar}
        navigateToBaul={() => {
          toggleSidebar();
          navigation.navigate("Baul"); // Navegar hacia "Baul"
        }}
      />

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
          name="EntriesHome"
          component={EntriesHome}
          options={{
            title: 'Tus Entradas',
            headerStyle: {
              backgroundColor: '#FFD700',
            },
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
              toggleSidebar();
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
        name="Main" // Cambiar el nombre para evitar duplicados
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Baul"
        component={Baul}
        options={{
          title: 'Baúl',
          headerStyle: {
            backgroundColor: '#FFD700',
          },
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
