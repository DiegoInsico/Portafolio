import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { AppContext } from '../../../../context/appContext'; // Asegúrate de tener la ruta correcta

const Vibracion = () => {
  const { toggleVibration } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Vibración</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Vibration.vibrate(50); // Vibración suave
          toggleVibration(true); // Guardar estado de vibración
        }}
      >
        <Text style={styles.buttonText}>Vibración Suave</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Vibration.vibrate(200); // Vibración media
          toggleVibration(true); // Guardar estado de vibración
        }}
      >
        <Text style={styles.buttonText}>Vibración Media</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          Vibration.vibrate(500); // Vibración fuerte
          toggleVibration(true); // Guardar estado de vibración
        }}
      >
        <Text style={styles.buttonText}>Vibración Fuerte</Text>
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
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Vibracion;
