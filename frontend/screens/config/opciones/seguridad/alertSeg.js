import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import styles from './../../../../components/styles'; 

const AlertSeg = () => {
  // Simulación de datos de inicio de sesión
  const [alertas, setAlertas] = useState([
    { id: '1', fecha: '2024-10-14', hora: '10:30 AM' },
    { id: '2', fecha: '2024-10-13', hora: '09:45 AM' },
    { id: '3', fecha: '2024-10-12', hora: '08:20 AM' },
  ]);

  // Función para renderizar cada alerta en la lista
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardText}>Fecha: {item.fecha}</Text>
      <Text style={styles.optionDescription}>Hora: {item.hora}</Text>
    </View>
  );

  return (
    <View style={styles.containerF}>
      <Text style={styles.title}>Alertas de Seguridad</Text>

      {/* Lista de alertas */}
      <FlatList
        data={alertas}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />

      {/* Botón para limpiar alertas, opcional */}
      <TouchableOpacity style={styles.buttonF} onPress={() => setAlertas([])}>
        <Text style={styles.buttonTextF}>Limpiar Alertas</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AlertSeg;
