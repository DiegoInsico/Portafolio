import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ModDaltonico = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paleta de Colores (Modo Daltónico)</Text>

      <View style={styles.colorBoxContainer}>
        <View style={[styles.colorBox, { backgroundColor: '#ff0000' }]} />
        <View style={[styles.colorBox, { backgroundColor: '#00ff00' }]} />
        <View style={[styles.colorBox, { backgroundColor: '#0000ff' }]} />
        <View style={[styles.colorBox, { backgroundColor: '#ffff00' }]} />
        <View style={[styles.colorBox, { backgroundColor: '#ff00ff' }]} />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Activar Modo Daltónico</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#fff',
  },
  colorBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ModDaltonico;
