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
import { signInWithEmailAndPassword } from "firebase/auth"; // Importa la función de autenticación de Firebase
import { auth } from "../../utils/firebase"; // Asegúrate de importar auth desde tu archivo firebase.js

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

  // Función para manejar el login usando Firebase
  const handleLogin = async (values, actions) => {
    const { correo, contrasena } = values;
    console.log("Datos a enviar:", { correo, contrasena });
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, correo, contrasena); // Usa Firebase para autenticar

      console.log("Login Exitoso.");
      Alert.alert("Éxito", "Has iniciado sesión correctamente.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      Alert.alert("Error", error.message || "Ocurrió un error al iniciar sesión.");
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

      <View style={styles.container}>
        <Text style={styles.title}>Inicia Sesión</Text>

        <Formik
          initialValues={{
            correo: "",
            contrasena: "",
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
                  onChangeText={handleChange("contrasena")}
                  onBlur={handleBlur("contrasena")}
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
                    name={showPassword ? "eye" : "eye-off"}
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
              <TouchableOpacity
                onPress={() => navigation.navigate("RequestPasswordReset")}
              >
                <Text style={styles.linkText}>Has olvidado tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
                <Text style={styles.linkText}>
                  ¿No tienes una cuenta? Regístrate
                </Text>
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
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
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
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 50,
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
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 10, // Radio de difuminado de la sombra (IOS)
    elevation: 10, // Elevación para sombra en Android
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
  toggleButton: {
    padding: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    color: "#fff",
    backgroundColor: "#D4AF37",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 10, // Radio de difuminado de la sombra (IOS)
    elevation: 10, // Elevación para sombra en Android
  },
  buttonDisabled: {
    color: "#fff",
    backgroundColor: "#4B4E6D",
    shadowColor: "#000000", // Color de la sombra
    shadowOffset: { width: 5, height: 5 }, // Desplazamiento de la sombra (horizonte/vertical)
    shadowOpacity: 0.4, // Opacidad de la sombra
    shadowRadius: 10, // Radio de difuminado de la sombra (IOS)
    elevation: 10, // Elevación para sombra en Android
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
