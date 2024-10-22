import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export const BloqueoContext = createContext();

export const BloqueoProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false);
  const navigation = useNavigation();

  // Iniciar el temporizador para el cierre de sesión o bloqueo de la app
  const iniciarTemporizador = (cerrarSesion) => {
    // Lógica para iniciar el temporizador que llame a cerrarSesion
  };

  // Función para verificar si la app está bloqueada al reingresar
  const desbloquearApp = async () => {
    const blockEnabled = await AsyncStorage.getItem('blockEnabled');
    if (blockEnabled === 'true') {
      // Redirigir a la pantalla de desbloqueo si el bloqueo está activado
      navigation.navigate('DesbloqApp');
    }
  };

  return (
    <BloqueoContext.Provider
      value={{
        bloqueoActivado,
        setBloqueoActivado,
        iniciarTemporizador,
        desbloquearApp,
      }}
    >
      {children}
    </BloqueoContext.Provider>
  );
};