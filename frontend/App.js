import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/auth/login";
import RegisterScreen from "./screens/auth/register";
import HomeScreen from "./screens/home/HomeScreen";
import ChangePasswordScreen from "./screens/auth/resetPass";
import TestGridPage from "./screens/home/homePrueba";
// Importa otras pantallas que necesites

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TestGridPage">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Iniciar Sesión" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Registro" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Inicio" }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: "Cambiar Contraseña" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
