import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../../utils/firebase"; // Asegúrate de tener configurado Firestore
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore"; // Importa deleteDoc para Firestore
import UserEntries from "../../components/general/userEntries";
import NotificationPreferences from "../../components/general/notificationPreferences";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);

  const auth = getAuth();

  // Obtener la información del usuario
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setUsername(currentUser.displayName || "");
      setProfileImage(
        currentUser.photoURL || "https://example.com/default-avatar.png"
      );
    }
  }, []);

  // Cambiar foto de perfil
  const changeProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUploading(true);
      const imageUri = result.uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      setProfileImage(downloadURL);
      setUploading(false);

      Alert.alert("Éxito", "La foto de perfil ha sido actualizada.");
    }
  };

  // Guardar cambios del perfil
  const handleSaveProfile = async () => {
    try {
      await updateProfile(user, { displayName: username });
      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema actualizando tu perfil.");
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (user) {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            onPress: async () => {
              try {
                // Eliminar el documento del usuario en Firestore
                await deleteDoc(doc(db, "users", user.uid));
                console.log("Documento de usuario eliminado de Firestore");

                // Eliminar el usuario de Firebase Authentication
                await user.delete();
                console.log("Usuario eliminado de Firebase Authentication");

                Alert.alert("Éxito", "Tu cuenta ha sido eliminada exitosamente.");
              } catch (error) {
                console.error("Error al eliminar la cuenta:", error);
                Alert.alert("Error", "Hubo un problema al eliminar tu cuenta.");
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Perfil de Usuario</Text>

      {/* Imagen de perfil */}
      <TouchableOpacity onPress={changeProfilePicture}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      </TouchableOpacity>

      <Text style={styles.label}>Nombre de Usuario</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Ingresa tu nombre de usuario"
      />

      {/* Sección de preferencias de notificación */}
      <NotificationPreferences />

      {/* Sección de entradas del usuario */}
      <UserEntries userId={auth.currentUser.uid} />

      {/* Botón para guardar cambios */}
      <Button
        title="Guardar Cambios"
        onPress={handleSaveProfile}
        color="#FFD700"
      />

      {/* Botón para borrar cuenta */}
      <Button
        title="Eliminar Cuenta"
        onPress={handleDeleteAccount}
        color="red" // Puedes cambiar el color como prefieras
      />

      {/* Indicador de carga al subir imagen */}
      {uploading && <Text style={styles.uploading}>Subiendo imagen...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#2C3E50",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFD700", // Color dorado para el encabezado
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
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#FFD700", // Color dorado para la etiqueta
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700", // Borde dorado
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff", // Fondo blanco para el input
  },
  uploading: {
    textAlign: "center",
    marginTop: 20,
    color: "#FFD700", // Color dorado para el texto de subida
  },
});

export default UserProfile;
