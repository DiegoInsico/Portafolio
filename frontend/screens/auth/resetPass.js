// screens/RequestPasswordReset.js

import React, { useState } from "react";
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
import axiosInstance from "../../utils/axiosInstance";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

// Definir el esquema de validación con Yup
const ResetPasswordSchema = Yup.object().shape({
  correo: Yup.string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
});

export default function RequestPasswordReset({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar la solicitud de reseteo de contraseña
  const handleRequestReset = async (values, actions) => {
    const { correo } = values;
    console.log("Correo a enviar:", { correo });
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/auth/request-password-reset", {
        correo: correo,
      });

      // Mostrar mensaje de éxito
      console.log(
        "Éxito",
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );

      // Navegar de regreso a la pantalla de Login
      navigation.goBack();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        const serverMessage =
          error.response.data.message || "Error al solicitar reseteo de contraseña.";
        Alert.alert("Error", serverMessage);
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado.");
      }
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      // Colores del degradado de izquierda a derecha
      colors={["#b6c0e8", "#ffcccb"]}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Image
        source={require("../../assets/flores.png")} // Reemplaza con la ruta de tu imagen
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.container}>
        <Text style={styles.title}>Restablecer Contraseña</Text>

        <Formik
          initialValues={{
            correo: "",
          }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleRequestReset}
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
                  onChangeText={handleChange("correo")}
                  onBlur={handleBlur("correo")}
                  value={values.correo}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  underlineColorAndroid="transparent" // Eliminar subrayado en Android
                />
              </View>
              {touched.correo && errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
              )}

              {/* Botón para solicitar reseteo */}
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
                  <Text style={styles.buttonText}>Enviar Solicitud</Text>
                )}
              </TouchableOpacity>

              {/* Enlace para volver al Login */}
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Volver a Iniciar Sesión</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    width: "85%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: 600,
    position: "absolute",
    top: 0,
    opacity: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    alignSelf: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ff9999", // Color del borde constante
    borderWidth: 1, // Ancho del borde constante
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
    // No agregar borderWidth aquí para evitar bordes adicionales
  },
  button: {
    backgroundColor: "#ff9999",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#000000",
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 5,
    marginLeft: 10,
  },
});
