// App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './screens/auth/login';
import Home from './screens/home/home';
import Registro from './screens/auth/register'; // Asegúrate de tener este componente
import EditarPerfil from './screens/profile/editProfile';
import RequestPasswordReset from './screens/auth/resetPass'; // Asegúrate de tener este componente

import { auth } from './utils/firebase'; // Ajusta la ruta según tu estructura de carpetas
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();

// Pantalla de Carga Mientras se Verifica el Estado de Autenticación
function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#3B873E" />
    </View>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    // Limpia el listener al desmontar el componente
    return unsubscribe;
  }, [initializing]);

  if (initializing) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Si el usuario está autenticado, mostrar el stack de la aplicación
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
        ) : (
          // Si el usuario no está autenticado, mostrar el stack de autenticación
          <>
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
            <Stack.Screen
              name="RequestPasswordReset"
              component={RequestPasswordReset}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EditarPerfil"
              component={EditarPerfil}
              options={{ title: 'Editar Perfil' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
