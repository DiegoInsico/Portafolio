import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

// Crear el contexto global
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false); // Estado para bloqueo
  const [vibrationFeedback, setVibrationFeedback] = useState(false); // Estado para vibración
  const [modoDaltonico, setModoDaltonico] = useState(false); // Estado para el modo daltónico
  const [fontSize, setFontSize] = useState(16); // Estado para tamaño de fuente

  // Cargar configuraciones guardadas desde AsyncStorage
  useEffect(() => {
    const cargarConfiguraciones = async () => {
      const bloqueado = await AsyncStorage.getItem('blockEnabled');
      const vibracion = await AsyncStorage.getItem('vibrationEnabled');
      const daltonico = await AsyncStorage.getItem('modoDaltonico');
      const savedFontSize = await AsyncStorage.getItem('fontSize');

      if (bloqueado === 'true') setBloqueoActivado(true);
      if (vibracion === 'true') setVibrationFeedback(true);
      if (daltonico === 'true') setModoDaltonico(true);
      if (savedFontSize) setFontSize(parseInt(savedFontSize)); // Cargar el tamaño de fuente guardado
    };

    cargarConfiguraciones();
  }, []);

  // Función para cambiar el tamaño de la fuente
  const changeFontSize = async (newSize) => {
    setFontSize(newSize);
    await AsyncStorage.setItem('fontSize', newSize.toString()); // Guardar el tamaño en AsyncStorage
  };

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

  // Función para activar/desactivar el modo daltónico
  const toggleModoDaltonico = async (estado) => {
    setModoDaltonico(estado);
    await AsyncStorage.setItem('modoDaltonico', estado ? 'true' : 'false');
  };

  return (
    <AppContext.Provider
      value={{
        bloqueoActivado,
        vibrationFeedback,
        modoDaltonico,
        fontSize,
        toggleBloqueo,
        toggleVibration,
        toggleModoDaltonico,
        changeFontSize, // Añadir changeFontSize al contexto
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
