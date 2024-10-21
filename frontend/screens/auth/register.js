import React, { useState } from 'react';
import {
  Image, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; 
import { auth, db } from '../../utils/firebase'; 
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { doc, setDoc } from "firebase/firestore"; // Importa setDoc para Firestore

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

  const handleRegister = async (values, actions) => {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, values.correo, values.contrasena
      );
      const user = userCredential.user;

      // Actualizar el perfil del usuario
      await updateProfile(user, {
        displayName: values.usuario,
      });

      // Crear documento en Firestore para el usuario
      await setDoc(doc(db, "users", user.uid), {
        displayName: values.usuario,
        email: values.correo,
        createdAt: new Date(),
        // Agrega otros campos que quieras guardar
      });

      Alert.alert('Registro exitoso', 'Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      navigation.navigate('Login'); 
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
      colors={["#2C3E50", "#4B4E6D", "#D1B17D", "#FFD700"]}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/background/florLogo.png")} // Reemplaza con la ruta de tu imagen
          style={styles.logo}
          resizeMode="cover"
        />
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
            <View style={styles.formContainer}>
              {/* Nombre de Usuario */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#000" style={styles.iconStyle} />
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
                <Ionicons name="mail" size={20} color="#000" style={styles.iconStyle} />
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
                <Ionicons name="lock-closed" size={20} color="#000" style={styles.iconStyle} />
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
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#000" />
                </TouchableOpacity>
              </View>
              {touched.contrasena && errors.contrasena && (
                <Text style={styles.errorText}>{errors.contrasena}</Text>
              )}

              {/* Confirmar Contraseña */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-open" size={20} color="#000" style={styles.iconStyle} />
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
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#000" />
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
  formContainer: {
    width: '100%',
    padding: 20, // Espaciado interno
    borderRadius: 10,
    backgroundColor: '#4B4E6D',
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10, // Sombra para Android
    marginBottom: 30,
    alignItems: 'center',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%', // Ajustamos el ancho del contenedor para que se centre
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150, // Ajusta el ancho de la imagen
    height: 150, // Ajusta la altura de la imagen
    marginTop: 50,
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 0, // Radio de difuminado de la sombra (IOS)
    elevation: 0, // Elevación para sombra en Android
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ff9999',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    width: '100%', // Los inputs cubren el 100% del contenedor del formulario
    backgroundColor: '#f9f9f9',
  },
  iconStyle: {
    marginRight: 5,
  },
  input: {
    height: 45, 
    width: '85%', 
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
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
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '85%', 
  },
  buttonDisabled: {
    opacity: 0.5, // Reduce la opacidad si está deshabilitado
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerLink: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 6,
  },
});
