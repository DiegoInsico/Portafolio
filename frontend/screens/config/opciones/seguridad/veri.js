import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { sendEmailVerification, updateEmail } from 'firebase/auth';
import { auth } from '../../../../utils/firebase'; // Asegúrate de que la ruta sea correcta
import styles from './../../../../components/styles'; 

const Veri = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  // Obtener el usuario actual de Firebase Auth
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setEmailVerified(currentUser.emailVerified);
    }
  }, []);

  // Función para enviar un correo de verificación al nuevo correo
  const enviarCorreoVerificacion = async () => {
    if (user && nuevoCorreo) {
      try {
        // Actualizar el correo en Firebase Auth
        await updateEmail(user, nuevoCorreo);
        // Enviar el correo de verificación
        await sendEmailVerification(user);
        Alert.alert(
          'Verificación Enviada',
          'Se ha enviado un correo de verificación al nuevo correo. Por favor, verifica tu correo.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Hubo un problema al enviar el correo de verificación. Inténtalo de nuevo.');
      }
    } else {
      Alert.alert('Error', 'Ingresa un nuevo correo antes de verificar.');
    }
  };

  return (
    <View style={styles.containerF}>
      <Text style={[styles.title, { marginBottom: 10 }]}>Verificación en 2 Pasos</Text>

      {user ? (
        <View>
          <Text style={[styles.optionDescription, { marginBottom: 5 }]}>Correo Actual: {user.email}</Text>
          <Text style={[styles.optionDescription, { marginBottom: 20 }]}>
            {emailVerified ? 'Correo Verificado' : 'Correo No Verificado'}
          </Text>

          {/* Campo para ingresar un nuevo correo */}
          <TextInput
            style={[styles.input, { marginBottom: 20 }]}
            placeholder="Ingresa un nuevo correo"
            value={nuevoCorreo}
            onChangeText={setNuevoCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Botón para enviar correo de verificación */}
          <TouchableOpacity style={styles.buttonF} onPress={enviarCorreoVerificacion}>
            <Text style={styles.buttonTextF}>Verificar Nuevo Correo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.optionDescription}>Cargando información del usuario...</Text>
      )}
    </View>
  );
};

export default Veri;
