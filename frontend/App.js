import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";  // Importa esto
import MainStackNavigator from "./navigation/MainStackNavigator";
import Home from "./screens/home/home";
import Login from "./screens/auth/login";
import Registro from "./screens/auth/register";
import RequestPasswordReset from "./screens/auth/resetPass";

// Define el stack
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>

    </NavigationContainer>
  );
}
