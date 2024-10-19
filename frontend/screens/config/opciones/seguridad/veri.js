import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { sendEmailVerification, updateEmail, reload } from 'firebase/auth'; // Importar reload
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

  // Función para actualizar la verificación del correo
  const comprobarVerificacion = async () => {
    try {
      await reload(auth.currentUser); // Recargar el usuario para obtener la verificación más reciente
      const currentUser = auth.currentUser;
      setEmailVerified(currentUser.emailVerified);
    } catch (error) {
      console.error('Error al recargar el estado de verificación', error);
    }
  };

  // Verificar si el correo ha sido validado cada vez que se monta o actualiza el componente
  useEffect(() => {
    const interval = setInterval(() => {
      comprobarVerificacion();
    }, 5000); // Verificar cada 5 segundos (puedes ajustar este tiempo)
    
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Encabezado */}
        <Text style={styles.title}>Verificación en 2 Pasos</Text>

        {user ? (
          <View style={styles.card}>
            <Text style={styles.subtitle}>Correo Actual:</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.subtitle}>
              {emailVerified ? 'Correo Verificado' : 'Correo No Verificado'}
            </Text>

            {/* Mostrar el input y botón de verificación solo si el correo no está verificado */}
            {!emailVerified && (
              <>
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
              </>
            )}
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default Veri;
