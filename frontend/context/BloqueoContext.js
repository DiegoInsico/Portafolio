import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export const BloqueoContext = createContext();

export const BloqueoProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false);
  const [tiempoBloqueo, setTiempoBloqueo] = useState(15); // Valor predeterminado de 15 segundos
  const navigation = useNavigation();

  // Iniciar el temporizador para el cierre de sesión o bloqueo de la app
  const iniciarTemporizador = (cerrarSesion) => {
    if (!tiempoBloqueo || isNaN(tiempoBloqueo)) {
      console.log('Error: El tiempo de bloqueo es indefinido o no es un número válido.');
      return;
    }
  
    setTimeout(() => {
      cerrarSesion();
    }, tiempoBloqueo * 1000); // Multiplicamos por 1000 para convertir los segundos a milisegundos
  
    console.log(`Temporizador de ${tiempoBloqueo} segundos configurado`);
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
        tiempoBloqueo,        // Agregar tiempoBloqueo al contexto
        setTiempoBloqueo,     // Agregar setTiempoBloqueo al contexto
      }}
    >
      {children}
    </BloqueoContext.Provider>
  );
};
