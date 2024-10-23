import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore para manejar las preferencias
import UserEntries from "../../components/general/userEntries";
import { FontAwesome } from "@expo/vector-icons";

const UserProfile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [zodiacSign, setZodiacSign] = useState("");
  const [belief, setBelief] = useState("");
  const [personalityType, setPersonalityType] = useState("");
  const [favoriteColor, setFavoriteColor] = useState("#2C3E50"); // Color favorito por defecto
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setUsername(currentUser.displayName || "Sin nombre de usuario");

      // Obtener la información del perfil y las preferencias de notificación desde Firestore
      const fetchUserProfile = async () => {
        const profileDoc = doc(db, "profiles", currentUser.email); // Usar el correo como identificador
        const profileSnapshot = await getDoc(profileDoc);

        if (profileSnapshot.exists()) {
          const profileData = profileSnapshot.data();
          setProfileImage(
            profileData.photoURL || "https://example.com/default-avatar.png"
          );
          setDescription(profileData.description || "Sin descripción");
          setZodiacSign(profileData.zodiacSign || "Sin signo zodiacal");
          setBelief(profileData.belief || "Sin creencias");
          setPersonalityType(profileData.personalityType || "Sin personalidad");
          setFavoriteColor(profileData.color || "#2C3E50"); // Recuperar el color favorito o usar uno por defecto
          setNotificationsEnabled(profileData.notificationsEnabled || false);
        }
      };
      fetchUserProfile();
    }
  }, []);

  // Función para manejar el cambio en las preferencias de notificación
  const handleToggleNotification = async () => {
    const userEmail = auth.currentUser.email;
    const userDoc = doc(db, "profiles", userEmail);

    try {
      await updateDoc(userDoc, { notificationsEnabled: !notificationsEnabled });
      setNotificationsEnabled((prev) => !prev);
      Alert.alert(
        "Éxito",
        `Notificaciones ${!notificationsEnabled ? "activadas" : "desactivadas"}`
      );
    } catch (error) {
      console.error("Error al actualizar preferencias: ", error);
      Alert.alert("Error", "Ocurrió un problema al actualizar tus preferencias.");
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: favoriteColor }]}>
      {/* Botón de Notificaciones */}
      <TouchableOpacity style={styles.notificationButton} onPress={handleToggleNotification}>
        <FontAwesome name="bell" size={24} color={notificationsEnabled ? "#FFD700" : "#767577"} />
      </TouchableOpacity>

      {/* Botón de Editar Perfil */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate("EditProfile")}
      >
        <FontAwesome name="pencil" size={24} color="#FFD700" />
      </TouchableOpacity>

      {/* Imagen de perfil */}
      <Image source={{ uri: profileImage }} style={styles.profileImage} />

      {/* Información del perfil */}
      <Text style={styles.usernameText}>{username}</Text>
      <Text style={styles.infoText}>{description}</Text>
      <Text style={styles.infoText}>{zodiacSign}</Text>
      <Text style={styles.infoText}>{belief}</Text>
      <Text style={styles.infoText}>{personalityType}</Text>

      {/* Sección de entradas del usuario */}
      <UserEntries userId={auth.currentUser.uid} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50
  },
  notificationButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 10,
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#FFD700", // Borde dorado
  },
  usernameText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#FFD700",
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 5,
    color: "#FFF",
  },
});

export default UserProfile;
