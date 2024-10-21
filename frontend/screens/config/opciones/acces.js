import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Background from '../../../components/background'; // Fondo personalizado
import { useNavigation } from '@react-navigation/native';

const Accesibilidad = () => {
  const navigation = useNavigation();

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Accesibilidad</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ModDaltonico')}
        >
          <Text style={styles.buttonText}>Modo Daltónico</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Fuentes')}
        >
          <Text style={styles.buttonText}>Tamaño de Fuentes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Vibracion')}
        >
          <Text style={styles.buttonText}>Vibración</Text>
        </TouchableOpacity>
      </View>
    </Background>
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

export default Accesibilidad;
