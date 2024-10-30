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
} from "react-native";
import { getAuth, updateProfile } from "firebase/auth";
import { db, storage } from "../../utils/firebase";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

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
      quality: 1,
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
      setProfileImage(downloadURL);
      setUploading(false);

      Alert.alert("Éxito", "La foto de perfil ha sido actualizada.");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(user, { displayName: username });
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        bio: bio,
        birthDate: birthDate,
      });
      Alert.alert("Éxito", "Tu perfil ha sido actualizado.");
    } catch (error) {
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

  if (loading) {
    return <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Perfil de Usuario</Text>

      <TouchableOpacity onPress={changeProfilePicture}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
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
            itemStyle={{ color: "#333" }}
          >
            <Picker.Item label="🇺🇸 +1" value="+1" color="#333" />
            <Picker.Item label="🇲🇽 +52" value="+52" color="#333" />
            <Picker.Item label="🇨🇱 +56" value="+56" color="#333" />
            <Picker.Item label="🇪🇸 +34" value="+34" color="#333" />
          </Picker>
        </View>
        <TextInput
          style={[styles.input, styles.phoneInput]}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Número de teléfono"
          placeholderTextColor="#A9A9A9"
          keyboardType="phone-pad"
        />
      </View>

      <Text style={styles.label}>Fecha de Nacimiento</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
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

      <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSaveProfile}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Eliminar Cuenta</Text>
      </TouchableOpacity>

      {uploading && <Text style={styles.uploading}>Subiendo imagen...</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#2C3E50",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFD700",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: "#FFD700",
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    color: "#F0E4C2",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#FFF",
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
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  picker: {
    width: 100,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    height: 40,
  },
  datePicker: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: "#FFF",
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    color: "#333",
  },
  bioInput: {
    height: 100,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#FFD700",
  },
  deleteButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  uploading: {
    textAlign: "center",
    marginTop: 20,
    color: "#FFD700",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
});

export default UserProfile;
