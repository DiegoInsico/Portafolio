import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from '../../../../utils/firebase'; 
import BackgroundWrapper from '../../../../components/background'; 

const AlertSeg = () => {
  const [alertas, setAlertas] = useState([]);

  // Obtener información del usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const nuevaAlerta = {
          id: Date.now().toString(),
          fecha: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString(),
        };
        setAlertas((prevAlertas) => [...prevAlertas, nuevaAlerta]);
      }
    });

    return () => unsubscribe(); // Limpiar el listener
  }, []);

  // Función para renderizar cada alerta en la lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
      <Text style={styles.cardText}>Hora: {item.hora}</Text>
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
          keyExtractor={item => item.id}
        />

        {/* Botón para limpiar alertas */}
        <TouchableOpacity style={styles.button} onPress={() => setAlertas([])}>
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
  button: {
    backgroundColor: '#3B873E',
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
