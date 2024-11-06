// components/UserProfile.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { getAuth, updateProfile } from "firebase/auth";
import { db, storage } from "../../utils/firebase";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const userRef = doc(db, "users", auth.currentUser.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        setUsername(currentUser.displayName || "");
        setProfileImage(
          currentUser.photoURL || "https://example.com/default-avatar.png"
        );

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPhoneNumber(data.phoneNumber || "");
          setCountryCode(data.countryCode || "+1");
          setBio(data.bio || "");
          setBirthDate(data.birthDate ? data.birthDate.toDate() : new Date());
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const changeProfilePicture = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Reducir la calidad para optimizar el tamaño
    });

    if (!result.canceled) {
      setUploading(true);
      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = ref(storage, `profile_pics/${user.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      await updateDoc(userRef, { photoURL: downloadURL }); // Guardar en Firestore

      setProfileImage(downloadURL);
      setUploading(false);

      Alert.alert("Éxito", "La foto de perfil ha sido actualizada.");
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Validación", "El nombre de usuario no puede estar vacío.");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Validación", "El número de teléfono no puede estar vacío.");
      return;
    }

    // Opcional: Agregar más validaciones según sea necesario

    try {
      await updateProfile(user, { displayName: username });
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        bio: bio,
        birthDate: birthDate,
        photoURL: profileImage, // Asegurarse de que la URL esté actualizada
      });
      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      Alert.alert("Error", "Hubo un problema actualizando tu perfil.");
    }
  };

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
                await deleteDoc(userRef);
                await user.delete();
                Alert.alert(
                  "Éxito",
                  "Tu cuenta ha sido eliminada exitosamente."
                );
                // Opcional: Navegar a la pantalla de inicio de sesión o cerrar la sesión
              } catch (error) {
                console.error("Error al eliminar la cuenta:", error);
                Alert.alert("Error", "Hubo un problema al eliminar tu cuenta.");
              }
            },
            style: "destructive",
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/background/Usuario.jpg")} // Ruta a tu imagen local
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Perfil de Usuario</Text>

        <TouchableOpacity
          onPress={changeProfilePicture}
          style={styles.imageContainer}
        >
          <Image
            source={{
              uri: profileImage || "https://example.com/default-avatar.png",
            }}
            style={styles.profileImage}
          />
          <View style={styles.cameraIconContainer}>
            <FontAwesome name="camera" size={20} color="#1C2833" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Nombre de Usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Ingresa tu nombre de usuario"
          placeholderTextColor="#A9A9A9"
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <Text style={styles.text}>{user?.email}</Text>

        <Text style={styles.label}>Número de Teléfono</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={countryCode}
              style={styles.picker}
              onValueChange={(itemValue) => setCountryCode(itemValue)}
              dropdownIconColor="#1C2833"
            >
              <Picker.Item label="🇺🇸 +1" value="+1" color="#333" />
              <Picker.Item label="🇲🇽 +52" value="+52" color="#333" />
              <Picker.Item label="🇨🇱 +56" value="+56" color="#333" />
              <Picker.Item label="🇪🇸 +34" value="+34" color="#333" />
              {/* Agregar más códigos de país según sea necesario */}
            </Picker>
          </View>
          <View style={styles.phoneInputContainer}>
            <FontAwesome name="phone" size={20} color="#FFD700" style={styles.phoneIcon} />
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Número de teléfono"
              placeholderTextColor="#A9A9A9"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePicker}
        >
          <Text style={styles.dateText}>{birthDate.toDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={birthDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Escribe una breve biografía"
          placeholderTextColor="#A9A9A9"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveProfile}
        >
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>

        {uploading && <Text style={styles.uploading}>Subiendo imagen...</Text>}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flexGrow: 1,
    paddingTop: 60, // Igual que headerStyle.height
    padding: 30,
    backgroundColor: "rgba(28, 40, 51, 0.8)", // Fondo semi-transparente oscuro
    paddingBottom: 40,
    alignItems: "center", // Centrar todos los elementos horizontalmente
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#FFD700",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  imageContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#FFD700",
    borderRadius: 20,
    padding: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#FFD700",
    fontWeight: "600",
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    color: "#F0E4C2",
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#333",
    fontSize: 16,
    marginBottom: 20,
    width: "100%",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginRight: 10,
    width: 100,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 10,
    flex: 1, // Tomar el espacio restante
    height: 50,
  },
  phoneIcon: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  datePicker: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    color: "#333",
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: "#FFD700",
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
  },
  buttonText: {
    color: "#1C2833", // Texto oscuro para contraste
    fontWeight: "bold",
    fontSize: 16,
  },
  uploading: {
    textAlign: "center",
    marginTop: 10,
    color: "#FFD700",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A252F",
  },
});

export default UserProfile;
