import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";  // Importa esto
import MainStackNavigator from "./navigation/MainStackNavigator";

// Define el stack
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <MainStackNavigator />
    </NavigationContainer>
  );
}
