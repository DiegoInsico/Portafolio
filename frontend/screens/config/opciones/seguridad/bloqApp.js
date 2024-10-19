import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BloqApp = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(false); // Switch para habilitar contraseña
  const [isPasswordAssigned, setIsPasswordAssigned] = useState(false); // Indica si ya hay una contraseña
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Verificar si hay un PIN guardado al montar el componente
  useEffect(() => {
    const checkExistingPin = async () => {
      try {
        const savedPin = await AsyncStorage.getItem('userPin');
        const isEnabled = await AsyncStorage.getItem('blockEnabled');
        setIsPasswordEnabled(isEnabled === 'true');
        if (savedPin) {
          setIsPasswordAssigned(true);
        }
      } catch (error) {
        console.error('Error al verificar el PIN:', error);
      }
    };
    checkExistingPin();
  }, []);

  // Función para guardar el nuevo PIN
  const guardarPin = async () => {
    if (pin === confirmPin) {
      try {
        await AsyncStorage.setItem('userPin', pin); // Guardar el PIN
        await AsyncStorage.setItem('blockEnabled', 'true'); // Habilitar el bloqueo
        Alert.alert('Éxito', 'PIN configurado correctamente.');
        setIsPasswordAssigned(true); // Se ha asignado una contraseña
        setIsChangingPassword(false);
        setPin('');
        setConfirmPin('');
      } catch (error) {
        Alert.alert('Error', 'Hubo un problema al guardar el PIN.');
      }
    } else {
      Alert.alert('Error', 'Los PIN ingresados no coinciden.');
    }
  };

  // Función para cambiar el PIN
  const cambiarPin = async () => {
    try {
      const savedPin = await AsyncStorage.getItem('userPin');
      if (oldPin === savedPin) {
        await AsyncStorage.setItem('userPin', newPin); // Guardar la nueva contraseña
        Alert.alert('Éxito', 'PIN cambiado correctamente.');
        setIsChangingPassword(false);
        setOldPin('');
        setNewPin('');
      } else {
        Alert.alert('Error', 'La contraseña actual es incorrecta.');
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cambiar la contraseña.');
    }
  };

  // Toggle para activar/desactivar la contraseña
  const togglePassword = async (value) => {
    setIsPasswordEnabled(value);
    if (!value) {
      await AsyncStorage.removeItem('userPin'); // Eliminar la contraseña si se desactiva
      setIsPasswordAssigned(false);
      setIsChangingPassword(false);
    }
    await AsyncStorage.setItem('blockEnabled', value.toString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Bloqueo de App</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Activar Contraseña</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isPasswordEnabled ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={togglePassword}
          value={isPasswordEnabled}
        />
      </View>

      {isPasswordEnabled && !isPasswordAssigned && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el PIN"
            value={pin}
            onChangeText={setPin}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirma el PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={guardarPin}>
            <Text style={styles.buttonText}>Guardar PIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPasswordAssigned && !isChangingPassword && (
        <View>
          <Text style={styles.infoText}>Contraseña Asignada</Text>
          <TouchableOpacity
            style={styles.buttonYellow}
            onPress={() => setIsChangingPassword(true)}
          >
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>
      )}

      {isChangingPassword && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Ingresa la contraseña actual"
            value={oldPin}
            onChangeText={setOldPin}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Nueva Contraseña"
            value={newPin}
            onChangeText={setNewPin}
            secureTextEntry
          />

          <TouchableOpacity style={styles.buttonYellow} onPress={cambiarPin}>
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>
      )}
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#000',
    marginRight: 10,
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
  buttonYellow: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 10,
  },
});

export default BloqApp;
