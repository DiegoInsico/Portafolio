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
        "#D4AF37", // Dorado suave
        "#E6C47F", // Melocotón suave/dorado claro
        "#C2A66B", // Dorado oscuro más neutro
        "#4B4E6D", // Azul grisáceo oscuro para las sombras
        "#2C3E50", // Negro grisáceo oscuro en la parte inferior
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <Image
        source={require("../../assets/background/imagen-fondo.png")} // Reemplaza con la ruta de tu imagen
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.container}>
        <Image
          source={require("../../assets/background/florLogo.png")} // Reemplaza con la ruta de tu imagen
          style={styles.logo}
          resizeMode="cover"
        />
        <Text style={styles.titleSoul}>Soul</Text>
      </View>

      <View>
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
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
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
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
    alignSelf: "center",
  },
  form: {
    width: "85%",
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
    width: '100%'
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
    color: "#fff",
    marginTop: 20,
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
