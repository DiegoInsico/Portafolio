import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './screens/auth/login';
import Registro from './screens/auth/register';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registro">
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Registro" 
          component={Registro} 
          options={{ headerShown: false }} 
        />
        {/* Agrega más pantallas si es necesario */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}