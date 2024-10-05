// screens/ChangePasswordScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axiosInstance from '../../utils/axiosInstance';

export default function ChangePasswordScreen({ navigation }) {
  const [contrasenaActual, setcontrasenaActual] = useState('');
  const [nuevaContrasena, setnuevaContrasena] = useState('');

  const handleChangePassword = async () => {
    if (!contrasenaActual || !nuevaContrasena) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await axiosInstance.put('/auth/change-password', {
        contrasenaActual,
        nuevaContrasena,
      });
      Alert.alert('Éxito', response.data.message);
      // Opcional: Navegar a otra pantalla o limpiar los campos
      setcontrasenaActual('');
      setnuevaContrasena('');
      navigation.goBack();
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      if (error.response && error.response.data) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error al cambiar la contraseña.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Contraseña</Text>
      <TextInput
        placeholder="Contraseña Actual"
        onChangeText={setCurrentPassword}
        value={currentPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Nueva Contraseña"
        onChangeText={setNewPassword}
        value={newPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Cambiar Contraseña" onPress={handleChangePassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Define tus estilos aquí
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
});
