import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { signOut } from '../utils/firebase';
import { auth } from './utils/firebase'; // Asegúrate de que la ruta sea correcta
import { useNavigation } from '@react-navigation/native';

const BloqueoContext = createContext();

export const useBloqueo = () => useContext(BloqueoContext);

export const BloqueoProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false);
  const [tiempoBloqueo, setTiempoBloqueo] = useState('30s'); // Valor predeterminado
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const intervalIdRef = useRef(null);
  const navigation = useNavigation();

  // Función para iniciar el temporizador global
  const iniciarTemporizador = () => {
    if (bloqueoActivado && !temporizadorActivo) {
      let tiempoRestante = convertirTiempo(tiempoBloqueo); // Convertir el tiempo a segundos
      setTemporizadorActivo(true);

      intervalIdRef.current = setInterval(() => {
        tiempoRestante -= 1;
        if (tiempoRestante <= 0) {
          detenerTemporizador();
          cerrarSesion(); // Cerrar sesión cuando el tiempo se agote
        }
      }, 1000);
    }
  };

  // Función para detener el temporizador global
  const detenerTemporizador = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setTemporizadorActivo(false);
    }
  };

  // Función para cerrar sesión y redirigir al usuario
  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      Alert.alert(
        'Sesión Cerrada',
        'La sesión ha sido cerrada automáticamente por inactividad.',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar la sesión.');
      console.error(error);
    }
  };

  // Convertir el tiempo seleccionado en segundos
  const convertirTiempo = (tiempo) => {
    switch (tiempo) {
      case '15s':
        return 15;
      case '30s':
        return 30;
      case '1m':
        return 60;
      case '5m':
        return 5 * 60;
      default:
        return 30;
    }
  };

  // Detener temporizador al salir del componente
  useEffect(() => {
    return () => detenerTemporizador();
  }, []);

  return (
    <BloqueoContext.Provider
      value={{
        bloqueoActivado,
        setBloqueoActivado,
        tiempoBloqueo,
        setTiempoBloqueo,
        iniciarTemporizador,
        detenerTemporizador,
      }}
    >
      {children}
    </BloqueoContext.Provider>
  );
};
