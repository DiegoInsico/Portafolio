// screens/Login.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../utils/axiosInstance';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

// Definir el esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  correo: Yup.string()
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  contrasena: Yup.string()
    .required('La contraseña es obligatoria'),
});

export default function Login({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Función para manejar el login
  const handleLogin = async (values, actions) => {
    const { correo, contrasena } = values;
    console.log('Datos a enviar:', { correo, contrasena });
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        correo,
        contrasena,
      });
      const token = response.data.access_token;
      await AsyncStorage.setItem('token', token);
      console.log('Login Exitoso.');
      Alert.alert('Éxito', 'Has iniciado sesión correctamente.');
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      if (axiosInstance.isAxiosError(error) && error.response) {
        const serverMessage =
          error.response.data.message || 'Error al iniciar sesión.';
        Alert.alert('Error', serverMessage);
      } else {
        Alert.alert('Error', 'Ocurrió un error inesperado.');
      }
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      // Colores del degradado de izquierda a derecha
      colors={['#b6c0e8', '#ffcccb']}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Image
        source={require('../../assets/flores.png')} // Reemplaza con la ruta de tu imagen
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.container}>
        <Text style={styles.title}>Inicia Sesión</Text>

        <Formik
          initialValues={{
            correo: '',
            contrasena: '',
          }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => (
            <View style={styles.form}>
              {/* Correo Electrónico */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail"
                  size={20}
                  color="#666"
                  style={styles.iconStyle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Correo Electrónico"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('correo')}
                  onBlur={handleBlur('correo')}
                  value={values.correo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  underlineColorAndroid="transparent" // Eliminar subrayado en Android
                />
              </View>
              {touched.correo && errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
              )}

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color="#666"
                  style={styles.iconStyle}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('contrasena')}
                  onBlur={handleBlur('contrasena')}
                  value={values.contrasena}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  underlineColorAndroid="transparent" // Eliminar subrayado en Android
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {touched.contrasena && errors.contrasena && (
                <Text style={styles.errorText}>{errors.contrasena}</Text>
              )}

              {/* Botón de Login */}
              <TouchableOpacity
                style={[
                  styles.button,
                  !(isValid && dirty) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!(isValid && dirty) || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              {/* Enlaces adicionales */}
              <TouchableOpacity onPress={() => navigation.navigate('ChangePassword')}>
                <Text style={styles.linkText}>Has olvidado tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '85%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    height: 600,
    position: 'absolute',
    top: 0,
    opacity: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    alignSelf: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ff9999', // Color del borde constante
    borderWidth: 1, // Ancho del borde constante
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  iconStyle: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    // No agregar borderWidth aquí para evitar bordes adicionales
  },
  toggleButton: {
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#ff9999',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#000000',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
