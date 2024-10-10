// src/navigation/MainStackNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/login";
import RegisterScreen from "../screens/auth/register";
import RequestPasswordReset from "../screens/auth/resetPass";
import Home from "../screens/home/home";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Iniciar Sesión">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Iniciar Sesión", headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Registro", headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: "Inicio" }}
      />
      <Stack.Screen
        name="RequestPasswordReset"
        component={RequestPasswordReset}
        options={{ title: "Cambiar Contraseña", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
