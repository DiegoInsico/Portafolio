// Registro.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../assets/background/login.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/background/florLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Regístrate</Text>
          </View>

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
                  <Ionicons name="person" size={20} color="#FFD700" style={styles.iconStyle} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de Usuario"
                    placeholderTextColor="#FFD700AA"
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
                  <Ionicons name="mail" size={20} color="#FFD700" style={styles.iconStyle} />
                  <TextInput
                    style={styles.input}
                    placeholder="Correo Electrónico"
                    placeholderTextColor="#FFD700AA"
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
                  <Ionicons name="lock-closed" size={20} color="#FFD700" style={styles.iconStyle} />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor="#FFD700AA"
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
                    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#FFD700" />
                  </TouchableOpacity>
                </View>
                {touched.contrasena && errors.contrasena && (
                  <Text style={styles.errorText}>{errors.contrasena}</Text>
                )}

                {/* Confirmar Contraseña */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-open" size={20} color="#FFD700" style={styles.iconStyle} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    placeholderTextColor="#FFD700AA"
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
                    <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#FFD700" />
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
                    <ActivityIndicator color="#2C3E50" />
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
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44, 62, 80, 0.7)", // Superposición semi-transparente
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD700",
    marginTop: 10,
    fontFamily: "Poppins_700Bold",
  },
  formContainer: {
    width: "100%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "rgba(75, 78, 109, 0.9)", // Fondo semi-transparente para el formulario
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  iconStyle: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#FFD700",
    fontFamily: "Poppins_400Regular",
  },
  toggleButton: {
    padding: 5,
  },
  errorText: {
    color: "#FF6F61",
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#FFD700AA",
  },
  buttonText: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  footerLink: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Poppins_700Bold",
  },
});

