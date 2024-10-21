import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

// Crear el contexto global
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false); // Estado para bloqueo
  const [vibrationFeedback, setVibrationFeedback] = useState(false); // Estado para vibración

  // Cargar configuraciones guardadas desde AsyncStorage
  useEffect(() => {
    const cargarConfiguraciones = async () => {
      const bloqueado = await AsyncStorage.getItem('blockEnabled');
      const vibracion = await AsyncStorage.getItem('vibrationEnabled');

      if (bloqueado === 'true') setBloqueoActivado(true);
      if (vibracion === 'true') setVibrationFeedback(true);
    };

    cargarConfiguraciones();
  }, []);

  // Función para activar/desactivar el bloqueo
  const toggleBloqueo = async (estado, navigation) => {
    setBloqueoActivado(estado);
    await AsyncStorage.setItem('blockEnabled', estado ? 'true' : 'false');
    if (estado && navigation) {
      navigation.navigate('DesbloqApp'); // Redirigir a desbloqueo si se activa
    }
  };

  // Función para activar/desactivar la vibración
  const toggleVibration = async (estado) => {
    setVibrationFeedback(estado);
    await AsyncStorage.setItem('vibrationEnabled', estado ? 'true' : 'false');
    if (estado) {
      Vibration.vibrate(100); // Vibración corta para confirmar
    }
  };

  // Función para verificar si la app está bloqueada al reingresar
  const desbloquearApp = async (navigation) => {
    const blockEnabled = await AsyncStorage.getItem('blockEnabled');
    if (blockEnabled === 'true' && navigation) {
      navigation.navigate('DesbloqApp'); // Redirigir a la pantalla de desbloqueo
    }
  };

  return (
    <AppContext.Provider
      value={{
        bloqueoActivado,
        vibrationFeedback,
        toggleBloqueo,
        toggleVibration,
        desbloquearApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
