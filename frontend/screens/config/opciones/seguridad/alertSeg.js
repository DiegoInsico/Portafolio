import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../../utils/firebase';
import BackgroundWrapper from '../../../../components/background';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 

const AlertSeg = () => {
  const navigation = useNavigation();
  const [alertas, setAlertas] = useState([]);

  // Cargar las alertas guardadas al iniciar la app
  const cargarAlertas = async () => {
    try {
      const alertasGuardadas = await AsyncStorage.getItem('alertas');
      if (alertasGuardadas) {
        setAlertas(JSON.parse(alertasGuardadas));
      }
    } catch (error) {
      console.error('Error al cargar alertas:', error);
    }
  };

  // Guardar las alertas en AsyncStorage
  const guardarAlertas = async (nuevasAlertas) => {
    try {
      await AsyncStorage.setItem('alertas', JSON.stringify(nuevasAlertas));
    } catch (error) {
      console.error('Error al guardar alertas:', error);
    }
  };

  // Agregar una nueva alerta
  const agregarAlerta = (mensaje) => {
    const nuevaAlerta = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString(),
      hora: new Date().toLocaleTimeString(),
      mensaje,
    };
    const nuevasAlertas = [...alertas, nuevaAlerta];
    setAlertas(nuevasAlertas);
    guardarAlertas(nuevasAlertas);
  };

  // Detectar inicio de sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        agregarAlerta(`Inicio de sesión exitoso para el usuario: ${user.email}`);
      }
    });

    cargarAlertas(); // Cargar las alertas al inicio

    return () => unsubscribe(); // Limpiar el listener
  }, []);

  // Función para manejar comportamiento sospechoso
  const reportarComportamientoSospechoso = () => {
    Alert.alert(
      "Reporte Enviado",
      "Tu seguridad nos importa, si crees que hay actividad inusual te recomendamos que cambies de contraseña.",
      [
        {
          text: "Cambiar Contraseña",
          onPress: () => {
            navigation.navigate("RequestPasswordReset"); // Navegar a la pantalla de cambio de contraseña
          },
        },
        {
          text: "Cancelar",
          style: "cancel",
        },
      ]
    );
  };

  // Función para limpiar todas las alertas
  const limpiarAlertas = async () => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de querer limpiar todas las alertas?",
      [
        {
          text: "Sí",
          onPress: async () => {
            setAlertas([]); // Limpiar el estado local
            await AsyncStorage.removeItem('alertas'); // Eliminar las alertas guardadas
            Alert.alert("Alertas limpiadas");
          },
        },
        {
          text: "No",
          style: "cancel",
        },
      ]
    );
  };

  // Renderizar cada alerta en la lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
      <Text style={styles.cardText}>Hora: {item.hora}</Text>
      <Text style={styles.cardText}>Mensaje: {item.mensaje}</Text>
    </View>
  );

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Alertas de Seguridad</Text>

        {/* Lista de alertas */}
        <FlatList
          data={alertas}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        {/* Botón para reportar comportamiento sospechoso */}
        <TouchableOpacity
          style={styles.buttonReportar}
          onPress={reportarComportamientoSospechoso}
        >
          <Text style={styles.buttonText}>Reportar Comportamiento Sospechoso</Text>
        </TouchableOpacity>

        {/* Botón para limpiar las alertas */}
        <TouchableOpacity
          style={styles.buttonLimpiar}
          onPress={limpiarAlertas}
        >
          <Text style={styles.buttonText}>Limpiar Alertas</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  buttonReportar: {
    backgroundColor: '#ff5722', // Botón rojo para acción importante
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonLimpiar: {
    backgroundColor: '#3B873E', // Botón verde para limpiar
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default AlertSeg;
