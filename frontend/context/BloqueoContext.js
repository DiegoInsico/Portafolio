import React, { createContext, useState, useRef, useEffect } from 'react';

export const BloqueoContext = createContext();

export const BloqueoProvider = ({ children }) => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false);
  const [tiempoBloqueo, setTiempoBloqueo] = useState(15); // Tiempo por defecto en segundos
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const intervalIdRef = useRef(null);

  const iniciarTemporizador = (cerrarSesion) => {
    if (bloqueoActivado && !temporizadorActivo) {
      let tiempoRestante = tiempoBloqueo;

      setTemporizadorActivo(true);
      intervalIdRef.current = setInterval(() => {
        tiempoRestante -= 1;

        // Agregar console.log para mostrar el tiempo restante
        console.log(`Tiempo restante: ${tiempoRestante} segundos`);

        if (tiempoRestante <= 0) {
          detenerTemporizador();
          console.log("Sesión cerrada por inactividad.");
          cerrarSesion(); // Aquí se invoca la función de cerrar sesión desde fuera del contexto
        }
      }, 1000);
    }
  };

  const detenerTemporizador = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setTemporizadorActivo(false);
    }
  };

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
