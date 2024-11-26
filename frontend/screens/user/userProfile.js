// src/components/UserProfile.js

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
import { Picker } from "@react-native-picker/picker";
import { getAuth, updateProfile } from "firebase/auth";
import { db, storage } from "../../utils/firebase";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesome, Ionicons } from "@expo/vector-icons";



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

  // Nuevos estados para País, Ciudad y Comuna
  const [pais, setPais] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [comuna, setComuna] = useState("");

  const auth = getAuth();
  const userRef = doc(db, "users", auth.currentUser.uid);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
            console.log("Datos del usuario:", data); // Log para depuración
            setPhoneNumber(data.phoneNumber || "");
            setCountryCode(data.countryCode || "+1");
            setBio(data.bio || "");
            setBirthDate(data.birthDate ? data.birthDate.toDate() : new Date());
            setPais(data.pais || "");
            setCiudad(data.ciudad || "");
            setComuna(data.comuna || "");
          } else {
            console.log("No se encontró el documento del usuario.");
          }
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        Alert.alert("Error", "Hubo un problema al obtener tus datos.");
      } finally {
        setLoading(false);
      }
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
    try {
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
    } catch (error) {
      console.error("Error al cambiar la foto de perfil:", error);
      Alert.alert("Error", "Hubo un problema al cambiar tu foto de perfil.");
      setUploading(false);
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
        pais: pais, // Guardar país
        ciudad: ciudad, // Guardar ciudad
        comuna: pais === "Chile" ? comuna : "", // Guardar comuna solo si es Chile
        photoURL: profileImage, // Asegurarse de que la URL esté actualizada
      });
      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
    } catch (error) {
      console.error("Error actualizando el perfil:", error);
      Alert.alert("Error", "Hubo un problema actualizando tu perfil.");
    }
  };

  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
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
                await currentUser.delete();
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
        <ActivityIndicator size="large" color="#4B9CD3" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/background/Usuario.jpg")} // Asegúrate de tener una imagen de fondo moderna
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
            <FontAwesome name="camera" size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* Nombre de Usuario */}
        <Text style={styles.label}>Nombre de Usuario</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Ingresa tu nombre de usuario"
          placeholderTextColor="#888"
        />

        {/* Correo Electrónico */}
        <Text style={styles.label}>Correo Electrónico</Text>
        <View style={styles.infoContainer}>
          <Ionicons name="mail-outline" size={20} color="#4B9CD3" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>

        {/* Número de Teléfono */}
        <Text style={styles.label}>Número de Teléfono</Text>
        <View style={styles.phoneContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={countryCode}
              style={styles.picker}
              onValueChange={(itemValue) => setCountryCode(itemValue)}
              dropdownIconColor="#4B9CD3"
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="🇺🇸 +1" value="+1" color="#333" />
              <Picker.Item label="🇲🇽 +52" value="+52" color="#333" />
              <Picker.Item label="🇨🇱 +56" value="+56" color="#333" />
              <Picker.Item label="🇪🇸 +34" value="+34" color="#333" />
              {/* Agrega más códigos de país según sea necesario */}
            </Picker>
          </View>
          <View style={styles.phoneInputContainer}>
            <Ionicons name="call-outline" size={20} color="#4B9CD3" />
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Número de teléfono"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* País */}
        <Text style={styles.label}>País</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="flag-outline" size={20} color="#4B9CD3" />
          <Picker
            selectedValue={pais}
            onValueChange={(itemValue) => {
              setPais(itemValue);
              setCiudad(""); // Resetear ciudad al cambiar país
              setComuna(""); // Resetear comuna al cambiar país
            }}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="#4B9CD3"
            itemStyle={styles.pickerItem}
          >
            {countries && countries.length > 0 ? (
              countries.map((country) => (
                <Picker.Item
                  key={country.value}
                  label={country.label}
                  value={country.value}
                  color="#333"
                />
              ))
            ) : (
              <Picker.Item label="No hay países disponibles" value="" />
            )}
          </Picker>
        </View>

        {/* Ciudad */}
        <Text style={styles.label}>Ciudad</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="home-outline" size={20} color="#4B9CD3" />
          <Picker
            selectedValue={ciudad}
            onValueChange={(itemValue) => setCiudad(itemValue)}
            style={styles.picker}
            mode="dropdown"
            dropdownIconColor="#4B9CD3"
            enabled={pais !== ""}
            itemStyle={styles.pickerItem}
          >
            {pais && cities[pais] && cities[pais].length > 0 ? (
              cities[pais].map((city) => (
                <Picker.Item
                  key={city.value}
                  label={city.label}
                  value={city.value}
                  color="#333"
                />
              ))
            ) : (
              <Picker.Item label="No hay ciudades disponibles" value="" />
            )}
          </Picker>
        </View>

        {/* Comuna (solo para Chile) */}
        {pais === "Chile" && (
          <>
            <Text style={styles.label}>Comuna</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="list-outline" size={20} color="#4B9CD3" />
              <Picker
                selectedValue={comuna}
                onValueChange={(itemValue) => setComuna(itemValue)}
                style={styles.picker}
                mode="dropdown"
                dropdownIconColor="#4B9CD3"
                enabled={ciudad !== ""}
                itemStyle={styles.pickerItem}
              >
                {ciudad && comunas[ciudad] && comunas[ciudad].length > 0 ? (
                  comunas[ciudad].map((comuna) => (
                    <Picker.Item
                      key={comuna.value}
                      label={comuna.label}
                      value={comuna.value}
                      color="#333"
                    />
                  ))
                ) : (
                  <Picker.Item label="No hay comunas disponibles" value="" />
                )}
              </Picker>
            </View>
          </>
        )}

        {/* Fecha de Nacimiento */}
        <Text style={styles.label}>Fecha de Nacimiento</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#4B9CD3" />
          <Text style={styles.dateText}>
            {birthDate.toLocaleDateString()}
          </Text>
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

        {/* Biografía */}
        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Escribe una breve biografía"
          placeholderTextColor="#888"
          multiline
        />

        {/* Botón Guardar Cambios */}
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveProfile}
        >
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>

        {/* Botón Eliminar Cuenta */}
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
    backgroundColor: "#F5F7FA", // Color de fondo alternativo si la imagen no carga
  },
  container: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Fondo semi-transparente claro
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  header: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 25,
    color: "#4B9CD3",
  },
  imageContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 25,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: "#4B9CD3",
    backgroundColor: "#E0E0E0",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4B9CD3",
    borderRadius: 20,
    padding: 5,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#fff",
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#555555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    color: "#333333",
    fontSize: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  picker: {
    flex: 1,
    height: 40,
    color: "#333333",
  },
  pickerItem: {
    height: 40,
    fontSize: 16,
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    width: 90,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    flex: 1,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  phoneIcon: {
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    color: "#333333",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dateText: {
    marginLeft: 10,
    color: "#555555",
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
    shadowColor: "#4B9CD3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: "#4B9CD3",
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  uploading: {
    textAlign: "center",
    marginTop: 10,
    color: "#4B9CD3",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});

export default UserProfile;
