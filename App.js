// App.js
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './screens/auth/login';
import Home from './screens/home/home';
import Registro from './screens/auth/register'; 
import RequestPasswordReset from './screens/auth/resetPass';
import Profile from './screens/auth/profile'; 
import Configuracion from './screens/config/configuracion'; 
import Seguridad from './screens/config/opciones/Seguridad'; 
import AlertSeg from './screens/config/opciones/seguridad/alertSeg'; 
import BloSes from './screens/config/opciones/seguridad/bloSes'; 
import Veri from './screens/config/opciones/seguridad/veri'; 
import AdminBene from './screens/Beneficiarios/adminBene'; 
import AdminCuenta from './screens/config/opciones/adminCuenta'; 
import AdminTest from './screens/testigos/adminTestigo'; 

import { auth } from './utils/firebase'; // Ajusta la ruta según tu estructura de carpetas
import { onAuthStateChanged } from 'firebase/auth';
import Acces from './screens/config/opciones/acces';
import Ajustes from './screens/config/opciones/ajustes';
import EliminarTest from './screens/testigos/opciones/eliminarTes';
import ModificarTest from './screens/testigos/opciones/modificarTes';
import AgregarTest from './screens/testigos/opciones/AgregarTes';

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
          <>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Profile" component={Profile} options={{ title: 'Perfil del Usuario' }} />
            <Stack.Screen name="Configuracion" component={Configuracion} options={{ title: 'Configuraciones' }} />
            <Stack.Screen name="AdminCuenta" component={AdminCuenta} options={{ title: 'Administrar Cuenta' }} />
            <Stack.Screen name="Acces" component={Acces} options={{ title: 'Accesibilidad' }} />
            <Stack.Screen name="Ajustes" component={Ajustes} options={{ title: 'Ajustes' }} />

            {/* seguridad */}
            <Stack.Screen name="Seguridad" component={Seguridad} options={{ title: 'Seguridad' }} />
            <Stack.Screen name="AlertSeg" component={AlertSeg} options={{ title: 'Alerta de Seguridad' }} />
            <Stack.Screen name="BloSes" component={BloSes} options={{ title: 'Bloqueo de Sesion' }} />  
            <Stack.Screen name="Veri" component={Veri} options={{ title: 'Verificacion' }} />

            <Stack.Screen name="AdminTest" component={AdminTest} options={{ title: 'Administrar Testigos' }} />
            <Stack.Screen name="AgregarTest" component={AgregarTest} options={{ title: 'Agregar Testigos' }} />
            <Stack.Screen name="ModificarTest" component={ModificarTest} options={{ title: 'Modificar Testigos' }} />
            <Stack.Screen name="EliminarTest" component={EliminarTest} options={{ title: 'Eliminar Testigos' }} />
            
            <Stack.Screen name="AdminBene" component={AdminBene} options={{ title: 'Administrar Beneficiarios' }} />
          </>
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
