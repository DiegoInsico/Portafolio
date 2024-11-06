// Login.js

import React, { useState, useEffect, useContext } from "react";
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formik } from "formik";
import * as Yup from "yup";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { AuthContext } from "../../context/AuthContext"; // Importar el contexto
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../utils/firebase"; // Asegúrate de importar `db` correctamente
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Definir el esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  correo: Yup.string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
  contrasena: Yup.string().required("La contraseña es obligatoria"),
});

export default function Login({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Si el usuario ya está autenticado, redirigir a MainTabs
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    }
  }, [user, navigation]);

  // Mostrar indicador de carga mientras se cargan las fuentes o el estado de autenticación
  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const handleLogin = async (values, actions) => {
    const { correo, contrasena } = values;
    setIsSubmitting(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, correo, contrasena);
      const user = userCredential.user;
  
      // Registro del inicio de sesión en Firestore
      await setDoc(doc(db, "sessions", `${user.uid}_${Date.now()}`), {
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
  
      // Login exitoso
      Alert.alert("Éxito", "Has iniciado sesión correctamente.");
      // La redirección se manejará automáticamente a través del contexto
    } catch (error) {
      let errorMessage = "Ocurrió un error al iniciar sesión.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No se encontró ningún usuario con este correo electrónico.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Contraseña incorrecta.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Correo electrónico inválido.";
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../assets/background/login.jpg")} // Ruta a tu imagen de fondo
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
            <Text style={styles.titleSoul}>" Soy "</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Inicia Sesión</Text>

            <Formik
              initialValues={{ correo: "", contrasena: "" }}
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
                    <Ionicons name="mail" size={20} color="#FFD700" style={styles.iconStyle} />
                    <TextInput
                      style={styles.input}
                      placeholder="Correo Electrónico"
                      placeholderTextColor="#FFD700AA"
                      onChangeText={handleChange("correo")}
                      onBlur={handleBlur("correo")}
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
                      onChangeText={handleChange("contrasena")}
                      onBlur={handleBlur("contrasena")}
                      value={values.contrasena}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                      <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#FFD700" />
                    </TouchableOpacity>
                  </View>
                  {touched.contrasena && errors.contrasena && (
                    <Text style={styles.errorText}>{errors.contrasena}</Text>
                  )}

                  {/* Botón de Login */}
                  <TouchableOpacity
                    style={[styles.button, !(isValid && dirty) && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={!(isValid && dirty) || isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#2C3E50" />
                    ) : (
                      <Text style={styles.buttonText}>Iniciar Sesión</Text>
                    )}
                  </TouchableOpacity>

                  {/* Enlaces adicionales */}
                  <View style={styles.linksContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate("RequestPasswordReset")}>
                      <Text style={styles.linkText}>¿Has olvidado tu contraseña?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
                      <Text style={styles.linkText}>¿No tienes una cuenta? Regístrate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2C3E50",
  },
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
  titleSoul: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD700",
    marginTop: 10,
    fontFamily: "Poppins_700Bold",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 15,
    alignSelf: "center",
    fontFamily: "Poppins_700Bold",
  },
  form: {
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
  linksContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#FFD700",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins_700Bold",
  },
});
