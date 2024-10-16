import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { signOut } from "firebase/auth"; // Importamos signOut de Firebase Auth
import { useNavigation } from "@react-navigation/native"; // Para manejar la navegación
import { auth } from "../../../../utils/firebase"; // Asegúrate de que la ruta sea correcta
import BackgroundWrapper from "../../../../components/background"; // Usar fondo

const BloSes = () => {
  const [bloqueoActivado, setBloqueoActivado] = useState(false); // Por defecto, el bloqueo está deshabilitado
  const [tiempoBloqueo, setTiempoBloqueo] = useState("15s"); // Valor predeterminado (15 segundos)
  const [temporizadorActivo, setTemporizadorActivo] = useState(false);
  const navigation = useNavigation();
  const intervalIdRef = useRef(null); // Referencia para almacenar el temporizador

  // Función para manejar el cambio del switch
  const toggleBloqueo = () => {
    setBloqueoActivado((prevState) => {
      if (!prevState) {
        iniciarTemporizador(); // Iniciar el temporizador si se activa el bloqueo
      } else {
        detenerTemporizador(); // Detener el temporizador si se desactiva el bloqueo
      }
      return !prevState;
    });
  };

  // Función para cerrar sesión (simular bloqueo)
  const cerrarSesion = async () => {
    try {
      await signOut(auth); // Cierra sesión del usuario en Firebase
      Alert.alert(
        "Sesión Cerrada",
        "La sesión ha sido cerrada automáticamente por inactividad.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo cerrar la sesión.");
      console.error(error);
    }
  };

  // Función que maneja el temporizador
  const iniciarTemporizador = () => {
    if (bloqueoActivado && !temporizadorActivo) {
      let tiempoRestante = convertirTiempo(tiempoBloqueo); // Convertir a segundos el tiempo seleccionado
      setTemporizadorActivo(true);

      intervalIdRef.current = setInterval(() => {
        tiempoRestante -= 1;
        if (tiempoRestante <= 0) {
          detenerTemporizador();
          cerrarSesion(); // Cerrar la sesión cuando el tiempo llega a 0
        }
      }, 1000);
    }
  };

  // Función para detener el temporizador
  const detenerTemporizador = () => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      setTemporizadorActivo(false);
    }
  };

  // Confirmación de tiempo de bloqueo
  const confirmarTiempoBloqueo = () => {
    Alert.alert(
      "Confirmación",
      `El tiempo de bloqueo automático se ha configurado a ${tiempoBloqueo}.`,
      [{ text: "OK" }]
    );
    detenerTemporizador();
    iniciarTemporizador(); // Reiniciar el temporizador al confirmar el tiempo
  };

  // Función para convertir el tiempo seleccionado a segundos
  const convertirTiempo = (tiempo) => {
    switch (tiempo) {
      case "15s":
        return 15;
      case "30s":
        return 30;
      case "1m":
        return 60;
      case "5m":
        return 5 * 60;
      default:
        return 30;
    }
  };

  // Detener el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      detenerTemporizador();
    };
  }, []);

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración de Bloqueo Automático</Text>

        {/* Switch para activar o desactivar el bloqueo automático */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Activar Bloqueo Automático</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={bloqueoActivado ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleBloqueo}
            value={bloqueoActivado}
          />
        </View>

        {/* Mostrar opciones de tiempo solo si el bloqueo está activado */}
        {bloqueoActivado && (
          <View>
            <Text style={styles.label}>Selecciona el tiempo de bloqueo:</Text>

            <Picker
              selectedValue={tiempoBloqueo}
              onValueChange={(itemValue) => setTiempoBloqueo(itemValue)}
              style={{
                width: 200,
                height: 50,
                color: "#fff",
                backgroundColor: "#333",
              }} // Ajustar ancho y color
              dropdownIconColor={"#fff"} // Color del icono de desplegable
            >
              <Picker.Item label="15 segundos" value="15s" />
              <Picker.Item label="30 segundos" value="30s" />
              <Picker.Item label="1 minuto" value="1m" />
              <Picker.Item label="5 minutos" value="5m" />
            </Picker>

            {/* Botón para confirmar la selección */}
            <TouchableOpacity
              style={styles.button}
              onPress={confirmarTiempoBloqueo}
            >
              <Text style={styles.buttonText}>Confirmar Tiempo de Bloqueo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start", // Alinear el contenido hacia arriba
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff", // Ajuste según el fondo
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#fff", // Ajuste según el fondo
    marginRight: 10,
  },
  picker: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#3B873E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default BloSes;
