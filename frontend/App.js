import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainStackNavigator from "./navigation/MainStackNavigator";

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
      <MainStackNavigator />
    </NavigationContainer>
  );
}
