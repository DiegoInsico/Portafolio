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
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { sendPasswordResetEmail } from "firebase/auth"; // Importa la función de Firebase
import { auth } from "../../utils/firebase"; // Importa la configuración de Firebase

// Definir el esquema de validación con Yup
const ResetPasswordSchema = Yup.object().shape({
  correo: Yup.string()
    .email("Ingresa un correo electrónico válido")
    .required("El correo electrónico es obligatorio"),
});

export default function RequestPasswordReset({ navigation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar la solicitud de reseteo de contraseña con Firebase
  const handleRequestReset = async (values, actions) => {
    const { correo } = values;
    console.log("Correo a enviar:", correo);
    setIsSubmitting(true);
    try {
      // Utiliza Firebase para enviar el enlace de restablecimiento de contraseña
      await sendPasswordResetEmail(auth, correo);
      
      Alert.alert(
        "Éxito",
        "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
      );
      
      // Navegar de regreso a la pantalla de Login
      navigation.goBack();
    } catch (error) {
      console.error("Error al solicitar reseteo de contraseña:", error.message);
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
    <LinearGradient
      colors={[
        "#2C3E50", // Negro grisáceo oscuro en la parte superior
        "#4B4E6D", // Azul grisáceo oscuro
        "#C2A66B", // Dorado oscuro más neutro
        "#D1B17D", // Dorado intermedio
        "#E6C47F", // Melocotón suave/dorado claro
        "#F0E4C2", // Tono crema (suave luz)
        "#F0E4C2", // Tono crema (suave luz) en el centro
        "#E6C47F", // Melocotón suave/dorado claro
        "#D1B17D", // Dorado intermedio
        "#C2A66B", // Dorado oscuro más neutro
        "#4B4E6D", // Azul grisáceo oscuro
        "#2C3E50", // Negro grisáceo oscuro en la parte inferior
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/background/florLogo.png")} // Reemplaza con la ruta de tu imagen
          style={styles.logo}
          resizeMode="cover"
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
              {/* Correo Electrónico */}
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail"
                  size={20}
                  color="#000000"
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
                />
              </View>
              {touched.correo && errors.correo && (
                <Text style={styles.errorText}>{errors.correo}</Text>
              )}

              {/* Botón para solicitar reseteo */}
              <TouchableOpacity
                style={[styles.button, !(isValid && dirty) && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={!(isValid && dirty) || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
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
    color: '#000000',
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
  errorText: {
    color: 'red',
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#ff9999',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    width: '85%', // Ajusta el ancho del botón
  },
  buttonDisabled: {
    backgroundColor: "#BFA500",
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 10, // Radio de difuminado de la sombra (IOS)
    elevation: 10, // Elevación para sombra en Android
  },
  buttonText: {
    color: '#fff',
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
