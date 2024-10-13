// src/navigation/MainStackNavigator.js

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Registro from "../screens/auth/register";
import Login from "../screens/auth/login";
import RequestPasswordReset from "../screens/auth/resetPass";
import Home from "../screens/home/home";

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">

      <Stack.Screen
        name="Login"
        component={Login}
        options={{ title: "Login", headerShown: false }}
      />
      <Stack.Screen
        name="Registro"
        component={Registro}
        options={{ title: "Registro", headerShown: false }}
      />
      <Stack.Screen
        name="RequestPasswordReset"
        component={RequestPasswordReset}
        options={{ title: "Cambiar Contraseña", headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: "Inicio", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
