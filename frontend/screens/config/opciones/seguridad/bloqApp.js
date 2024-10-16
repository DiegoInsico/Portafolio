import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundWrapper from '../../../../components/background'; // Fondo personalizado

const BloqApp = () => {
  const [pin, setPin] = useState(''); // Para almacenar el pin ingresado por el usuario
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false); // Estado del switch de bloqueo

  // Cargar el estado del bloqueo al iniciar la app
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('userPin');
        const blockEnabled = await AsyncStorage.getItem('blockEnabled');
        if (savedPin) setPin(savedPin); // Cargar el PIN guardado
        if (blockEnabled === 'true') setIsPasswordEnabled(true); // Cargar el estado del bloqueo
      } catch (error) {
        console.error('Error cargando la configuración:', error);
      }
    };
    loadSettings();
  }, []);

  // Guardar el PIN y el estado del bloqueo
  const savePin = async () => {
    try {
      await AsyncStorage.setItem('userPin', pin); // Guardamos el PIN/Contraseña
      await AsyncStorage.setItem('blockEnabled', isPasswordEnabled.toString()); // Guardamos el estado del bloqueo
      Alert.alert('Guardado', 'PIN/Contraseña guardado correctamente.');
    } catch (error) {
      console.error('Error guardando el PIN:', error);
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Configurar Bloqueo de la Aplicación</Text>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Habilitar Bloqueo</Text>
          <Switch
            value={isPasswordEnabled}
            onValueChange={(value) => setIsPasswordEnabled(value)}
          />
        </View>

        {isPasswordEnabled && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Ingresa un PIN o Contraseña"
              value={pin}
              onChangeText={setPin}
              secureTextEntry={true}
            />
            <TouchableOpacity style={styles.button} onPress={savePin}>
              <Text style={styles.buttonText}>Guardar PIN/Contraseña</Text>
            </TouchableOpacity>
          </>
        )}
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: 'white',
    marginRight: 10,
  },
});

export default BloqApp;
