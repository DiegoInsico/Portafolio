import React, { useState, useEffect } from "react";
import { useFonts } from 'expo-font';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import * as Yup from "yup";
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
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si el usuario ya está autenticado, redirigir a Home
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    });

    // Limpia el listener al desmontar el componente
    return () => unsubscribe();
  }, [navigation]);

  // Mostrar indicador de carga mientras se cargan las fuentes
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
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
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
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
    <LinearGradient
      colors={[
        "#2C3E50", "#4B4E6D", "#C2A66B", "#D1B17D", "#E6C47F", "#F0E4C2",
        "#F0E4C2", "#E6C47F", "#D1B17D", "#C2A66B", "#4B4E6D", "#2C3E50",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/background/florLogo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.titleSoul}>" Soy "</Text>
      </View>

      <View style={styles.container}>
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
            <View style={styles.formContainer}>
              {/* Correo Electrónico */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#000000" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Correo Electrónico"
                  placeholderTextColor="#aaa"
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
                <Ionicons name="lock-closed" size={20} color="#000000" style={styles.iconStyle} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#aaa"
                  onChangeText={handleChange("contrasena")}
                  onBlur={handleBlur("contrasena")}
                  value={values.contrasena}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleButton}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#000000" />
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
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>

              {/* Enlaces adicionales */}
              <TouchableOpacity onPress={() => navigation.navigate("RequestPasswordReset")}>
                <Text style={styles.linkText}>¿Has olvidado tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  logo: {
    width: 150,
    height: 150,
    marginTop: 50,
  },
  titleSoul: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    alignSelf: "center",
    fontFamily: "Poppins_400Regular",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 15,
    alignSelf: "center",
    fontFamily: "Poppins_400Regular",
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#4B4E6D',
    marginBottom: 30,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ff9999",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  iconStyle: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    color: "#333",
  },
  toggleButton: {
    padding: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    width: '90%'
  },
  buttonDisabled: {
    backgroundColor: "#BFA500",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#fff",
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
});
