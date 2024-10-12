import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Importamos el método para crear usuario y actualizar perfil
import { auth } from '../../utils/firebase'; // Asegúrate de tener correctamente configurada la autenticación de Firebase
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

// Definir el esquema de validación con Yup
const RegisterSchema = Yup.object().shape({
  usuario: Yup.string()
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres')
    .required('El nombre de usuario es obligatorio'),
  correo: Yup.string()
    .email('Ingresa un correo electrónico válido')
    .required('El correo electrónico es obligatorio'),
  contrasena: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(/[a-zA-Z]/, 'La contraseña debe contener al menos una letra')
    .matches(/\d/, 'La contraseña debe contener al menos un número')
    .required('La contraseña es obligatoria'),
  confirmarContrasena: Yup.string()
    .oneOf([Yup.ref('contrasena'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

export default function Registro({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para manejar el registro
  const handleRegister = async (values, actions) => {
    setIsSubmitting(true);
    try {
      // Crear el usuario con correo y contraseña en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, values.correo, values.contrasena
      );
      const user = userCredential.user;

      // Actualizar el perfil del usuario para añadir el nombre de usuario
      await updateProfile(user, {
        displayName: values.usuario,
      });

      Alert.alert('Registro exitoso', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      navigation.navigate('Login'); // Navegar al login tras el registro
    } catch (error) {
      console.error('Error al registrar:', error.message);
      Alert.alert('Error', error.message || 'Ocurrió un error al registrar.');
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#D4AF37', '#E6C47F', '#C2A66B', '#4B4E6D', '#2C3E50']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Regístrate</Text>

        <Formik
          initialValues={{
            usuario: '', correo: '', contrasena: '', confirmarContrasena: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegister}
        >
          {({
            handleChange, handleBlur, handleSubmit, values, errors, touched, isValid, dirty,
          }) => (
            <View style={styles.form}>
              {/* Nombre de Usuario */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#666" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de Usuario"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('usuario')}
                  onBlur={handleBlur('usuario')}
                  value={values.usuario}
                  autoCapitalize="none"
                />
              </View>
              {touched.usuario && errors.usuario && (
                <Text style={styles.errorText}>{errors.usuario}</Text>
              )}

              {/* Correo Electrónico */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#666" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo Electrónico"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('correo')}
                  onBlur={handleBlur('correo')}
                  value={values.correo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {touched.correo && errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
              )}

              {/* Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('contrasena')}
                  onBlur={handleBlur('contrasena')}
                  value={values.contrasena}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.toggleButton}
                >
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {touched.contrasena && errors.contrasena && (
                <Text style={styles.errorText}>{errors.contrasena}</Text>
              )}

              {/* Confirmar Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-open" size={20} color="#666" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar Contraseña"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange('confirmarContrasena')}
                  onBlur={handleBlur('confirmarContrasena')}
                  value={values.confirmarContrasena}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.toggleButton}
                >
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
              {touched.confirmarContrasena && errors.confirmarContrasena && (
                <Text style={styles.errorText}>{errors.confirmarContrasena}</Text>
              )}

              {/* Botón de Registro */}
              <TouchableOpacity
                style={[styles.button, !(isValid && dirty) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!(isValid && dirty) || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Registrar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </TouchableOpacity>
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
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150, // Ajusta el ancho de la imagen
    height: 150, // Ajusta la altura de la imagen
    position: "flex",
    marginTop: 50,
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 0, // Radio de difuminado de la sombra (IOS)
    elevation: 0, // Elevación para sombra en Android
  },
  image: {
    width: "70%", // Ajusta el ancho de la imagen
    height: 200, // Ajusta la altura de la imagen
    position: "absolute", // Usa "absolute" para posicionar la imagen
    right: 0, // Pega la imagen a la derecha
    bottom: 0, // Pega la imagen al fondo
    opacity: 0.8, // Ajusta la opacidad de la imagen
  },
  titleSoul: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    alignSelf: "center",
    fontFamily: "Montserrat",
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
    height: 50,
    width: "100%",
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
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
  footer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
  },
  footerText: {
    color: '#333',
    fontSize: 14,
  },
  footerLink: {
    color: '#6200EE',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
