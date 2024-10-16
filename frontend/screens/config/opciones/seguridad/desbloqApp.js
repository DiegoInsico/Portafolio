import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundWrapper from '../../../../components/background'; // Fondo personalizado

const DesbloqApp = ({ navigation }) => {
  const [inputPin, setInputPin] = useState(''); // Para el PIN que el usuario ingresa al desbloquear

  // Función para verificar el PIN/Contraseña almacenado en AsyncStorage
  const unlockApp = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      const blockEnabled = await AsyncStorage.getItem('blockEnabled');

      if (blockEnabled === 'true' && savedPin === inputPin) {
        Alert.alert('Desbloqueado', 'Has desbloqueado la aplicación.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }], // Redirigir a Home
        });
      } else {
        Alert.alert('Error', 'El PIN/Contraseña es incorrecto o el bloqueo está deshabilitado.');
      }
    } catch (error) {
      console.error('Error verificando el PIN:', error);
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Desbloquear Aplicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu PIN o Contraseña"
          value={inputPin}
          onChangeText={setInputPin}
          secureTextEntry={true}
        />
        <TouchableOpacity style={styles.button} onPress={unlockApp}>
          <Text style={styles.buttonText}>Desbloquear</Text>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: 'white',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DesbloqApp;
