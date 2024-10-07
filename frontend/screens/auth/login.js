import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../../utils/axiosInstance";

const Login = ({ navigation }) => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        correo,
        contrasena,
      });
      const token = response.data.access_token;
      await AsyncStorage.setItem("token", token);
      console.log("Login Exitoso.");
      navigation.replace("Home");
    } catch (error) {
      console.error(error);
      console.log("Error al iniciar sesion.");
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
        <Text style={styles.title}>Inicia Sesión</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#aaa"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#aaa"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <Text onPress={() => navigation.navigate("ChangePassword")}>
          Has olvidado tu contrasena?
        </Text>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate("Register")}>
          ¿No tienes una cuenta? Regístrate
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 600,
    position: "absolute",
    top: 0,
    opacity: 0.7,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 10,
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#ff9999",
    paddingVertical: 15,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
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
  },
});

export default Login; // Exporta el componente como default