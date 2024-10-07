// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const getUserInfo = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        navigation.replace('Login');
      } else {
        // Opcional: Decodificar el token para obtener información del usuario
        // Por simplicidad, asumiremos que el email está almacenado
        setEmail('usuario@example.com'); // Reemplaza con datos reales
      }
    };

    getUserInfo();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenido, {email}</Text>
      <Button title="Cerrar Sesión" onPress={handleLogout} />
    </View>
  );
}
