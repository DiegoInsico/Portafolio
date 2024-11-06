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
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";

// Definir el esquema de validación con Yup
const ResetPasswordSchema = Yup.object().shape({
  correo: Yup.string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
});

export default function RequestPasswordReset({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestReset = async (values, actions) => {
    const { correo } = values;
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, correo);
      Alert.alert(
        "Éxito",
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Ocurrió un error al solicitar el reseteo de contraseña."
      );
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
        <View style={styles.container}>
          <Image
            source={require("../../assets/background/florLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
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
              <View style={styles.formContainer}>
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

                <TouchableOpacity
                  style={[styles.button, !(isValid && dirty) && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={!(isValid && dirty) || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#2C3E50" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar Solicitud</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Volver a Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFD700",
    marginBottom: 20,
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
  },
  errorText: {
    color: "#FF6F61",
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 12,
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
  },
  footerLink: {
    color: "#FFD700",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 20,
  },
});
