import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { sendEmailVerification, updateEmail } from 'firebase/auth';
import { auth } from '../../../../utils/firebase'; // Asegúrate de que la ruta sea correcta
import BackgroundWrapper from '../../../../components/background'; // Usar el fondo

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
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Encabezado */}
        <Text style={styles.title}>Verificación en 2 Pasos</Text>

        {user ? (
          <View style={styles.contentContainer}>
            <Text style={styles.subtitle}>Correo Actual: {user.email}</Text>
            <Text style={styles.subtitle}>
              {emailVerified ? 'Correo Verificado' : 'Correo No Verificado'}
            </Text>

            {/* Campo para ingresar un nuevo correo */}
            <TextInput
              style={styles.input}
              placeholder="Ingresa un nuevo correo"
              value={nuevoCorreo}
              onChangeText={setNuevoCorreo}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Botón para enviar correo de verificación */}
            <TouchableOpacity style={styles.button} onPress={enviarCorreoVerificacion}>
              <Text style={styles.buttonText}>Verificar Nuevo Correo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.subtitle}>Cargando información del usuario...</Text>
        )}
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Asegurar que el contenido esté más arriba
    paddingHorizontal: 20, // Añadir espacio lateral
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff', // Cambia según tu fondo
    textAlign: 'left', // Alinear el título a la izquierda
  },
  contentContainer: {
    marginTop: 20, // Espacio entre el título y el contenido
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
    color: '#fff', // Cambia según tu fondo
  },
  input: {
    width: '100%', // Ocupar todo el ancho de la pantalla
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%', // Asegurar que el botón ocupe el ancho total
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Veri;
