import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LoginScreen from "./screens/auth/login";
import RegisterScreen from "./screens/auth/register";
import Home from "./screens/home/home";
import RequestPasswordReset from "./screens/auth/resetPass";
// Importa otras pantallas que necesites

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">

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
          component={Home}
          options={{ title: "Inicio" }}
        />
        <Stack.Screen
          name="RequestPasswordReset"
          component={RequestPasswordReset}
          options={{ title: "Cambiar Contraseña" }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
