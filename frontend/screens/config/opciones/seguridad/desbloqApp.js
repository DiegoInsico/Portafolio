import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DesbloqApp = ({ setIsLocked }) => {
  const [pin, setPin] = useState('');

  const desbloquearApp = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      if (pin === savedPin) {
        setIsLocked(false); // Desbloquear la app
      } else {
        Alert.alert('Error', 'El PIN ingresado es incorrecto.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al desbloquear la app.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Desbloquear App</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa el PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={desbloquearApp}>
        <Text style={styles.buttonText}>Desbloquear</Text>
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
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default DesbloqApp;
