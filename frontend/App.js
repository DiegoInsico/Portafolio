import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, ImageBackground, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para manejar el almacenamiento local

import { BloqueoProvider } from "./context/BloqueoContext";
import Login from './screens/auth/login'; 
import Home from "./screens/home/home";
import Registro from "./screens/auth/register"; 
import EditProfile from "./screens/profile/editProfile"; 
import RequestPasswordReset from "./screens/auth/resetPass"; 
import EntriesHome from "./screens/entrys/entriesHome";
import { auth } from "./utils/firebase"; 
import { onAuthStateChanged } from "firebase/auth";

import Configuracion from './screens/config/configuracion'; 
import Seguridad from './screens/config/opciones/Seguridad'; 
import AlertSeg from './screens/config/opciones/seguridad/alertSeg'; 
import BloSes from './screens/config/opciones/seguridad/bloSes'; 
import Veri from './screens/config/opciones/seguridad/veri'; 
import AdminBene from './screens/Beneficiarios/adminBene'; 
import AdminCuenta from './screens/config/opciones/adminCuenta'; 
import AdminTest from './screens/testigos/adminTestigo'; 
import BloqApp from './screens/config/opciones/seguridad/bloqApp';
import DesbloqApp from './screens/config/opciones/seguridad/desbloqApp';

import Acces from './screens/config/opciones/acces';
import Ajustes from './screens/config/opciones/ajustes';
import EliminarTest from './screens/testigos/opciones/eliminarTes';
import ModificarTest from './screens/testigos/opciones/modificarTes';
import AgregarTest from './screens/testigos/opciones/AgregarTes';
import Temas from './screens/config/opciones/temas'; 
import Fuentes from "./screens/config/opciones/accesibilidad/Text";
import Vibracion from "./screens/config/opciones/accesibilidad/vibra";
import ModDaltonico from "./screens/config/opciones/accesibilidad/modDal";

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
  const [isLocked, setIsLocked] = useState(false); // Estado global para el bloqueo de la app
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false);

  // Estado para manejar la imagen de fondo global
  const [backgroundImage, setBackgroundImage] = useState(require('./assets/test/background.webp'));

  // Verificar si hay un PIN guardado en AsyncStorage al iniciar
  const checkPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      const isEnabled = await AsyncStorage.getItem('isPasswordEnabled');
      setIsPasswordEnabled(isEnabled === 'true');
      if (savedPin && isEnabled === 'true') {
        setIsLocked(true); // Bloqueamos si hay PIN guardado
      }
    } catch (error) {
      console.error('Error verificando el PIN:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    checkPin(); // Verificar si la app debe estar bloqueada al iniciar

    return () => unsubscribe();
  }, [initializing]);

  // Manejar el cambio de estado de la app (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && isPasswordEnabled) {
        setIsLocked(true); // Bloquear la app cuando se minimiza si el bloqueo está habilitado
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isPasswordEnabled]);

  if (initializing) return <SplashScreen />;

  if (isLocked) {
    // Si la app está bloqueada, mostramos la página de desbloqueo
    return (
      <DesbloqApp setIsLocked={setIsLocked} /> // Pasamos la función para desbloquear
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <NavigationContainer>
        <BloqueoProvider>
          <Stack.Navigator>
            {user ? (
              <>
                {/* Si el usuario está autenticado, mostrar el stack de la aplicación */}
                <Stack.Screen
                  name="Home"
                  component={Home}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="EditProfile"
                  component={EditProfile}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Configuracion"
                  component={Configuracion}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AdminCuenta"
                  component={AdminCuenta}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Acces"
                  component={Acces}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Ajustes"
                  component={Ajustes}
                  options={{ headerShown: false }}
                />
                {/* seguridad */}
                <Stack.Screen
                  name="Seguridad"
                  component={Seguridad}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AlertSeg"
                  component={AlertSeg}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="BloSes"
                  component={BloSes}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Veri"
                  component={Veri}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="BloqApp"
                  component={BloqApp}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="DesbloqApp"
                  component={DesbloqApp}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="EntriesHome"
                  component={EntriesHome}
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="Temas" options={{ headerShown: false }}>
                  {() => <Temas setBackgroundImage={setBackgroundImage} />}
                </Stack.Screen>
                <Stack.Screen
                  name="AdminTest"
                  component={AdminTest}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AgregarTest"
                  component={AgregarTest}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ModificarTest"
                  component={ModificarTest}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="EliminarTest"
                  component={EliminarTest}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="AdminBene"
                  component={AdminBene}
                  options={{ headerShown: false }}
                />
                {/* paginas de testeo */}
                <Stack.Screen
                  name="Fuentes"
                  component={Fuentes}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="Vibracion"
                  component={Vibracion}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="ModDaltonico"
                  component={ModDaltonico}
                  options={{ headerShown: false }}
                />
              </>
            ) : (
              <>
                {/* Si el usuario no está autenticado, mostrar el stack de autenticación */}
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
        </BloqueoProvider>          
      </NavigationContainer>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
