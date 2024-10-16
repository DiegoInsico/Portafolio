import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from './../../components/background'; // Ruta al componente BackgroundWrapper

const Configuracion = ({ navigation }) => {
  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Configuraciones</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Seguridad')}>
          <Text style={styles.buttonText}>Seguridad y Privacidad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AdminCuenta')}>
          <Text style={styles.buttonText}>Administrar Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Temas')}>
          <Text style={styles.buttonText}>Temas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Acces')}>
          <Text style={styles.buttonText}>Accesibilidad</Text>
        </TouchableOpacity>

      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Configuracion;
