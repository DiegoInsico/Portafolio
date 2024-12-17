// Beneficiarios.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { db, storage } from "../../utils/firebase"; // Asegúrate de exportar storage desde firebase.js
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Importar funciones de storage
import * as ImageManipulator from "expo-image-manipulator"; // Opcional para manipulación de imágenes

const Beneficiarios = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // Nuevo estado para manejar la carga

  useEffect(() => {
    const fetchBeneficiarios = async () => {
      if (!userId) {
        console.log("Usuario no autenticado.");
        return;
      }
      try {
        const beneficiariosRef = collection(db, "beneficiarios");
        const q = query(beneficiariosRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const beneficiariosList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBeneficiarios(beneficiariosList);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener beneficiarios: ", error);
        setLoading(false);
      }
    };
    fetchBeneficiarios();
  }, [userId]);

  // Función para optimizar la imagen antes de subirla (opcional)
  const optimizeImage = async (uri) => {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Ajusta el tamaño según sea necesario
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permiso Denegado",
        "Necesitamos permiso para acceder a tu galería de imágenes."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7, // Reducir calidad para optimizar la carga
    });

    if (!result.canceled) {
      const optimizedUri = await optimizeImage(result.assets[0].uri);
      setProfileImage(optimizedUri);
    }
  };

  // Función para subir la imagen a Firebase Storage y obtener la URL
  const uploadImageAsync = async (uri) => {
    if (!uri) return null;

    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      const filename = `${userId}_${Date.now()}`; // Nombre único para la imagen
      const storageRef = ref(storage, `beneficiarios/${filename}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      return downloadURL;
    } catch (error) {
      console.error("Error al subir la imagen: ", error);
      setUploading(false);
      Alert.alert("Error", "No se pudo subir la imagen.");
      return null;
    }
  };

  const handleAddOrUpdateBeneficiary = async () => {
    if (!email || !name) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }
    if (!userId) {
      Alert.alert("Error", "No se pudo obtener el ID del usuario.");
      return;
    }

    try {
      let imageURL = profileImage;

      // Si hay una imagen seleccionada y es una URI local, subirla
      if (profileImage && profileImage.startsWith("file://")) {
        imageURL = await uploadImageAsync(profileImage);
      }

      const newBeneficiary = { name, email, phone, profileImage: imageURL, userId };

      if (editingId) {
        const beneficiaryRef = doc(db, "beneficiarios", editingId);
        await updateDoc(beneficiaryRef, newBeneficiary);
        setBeneficiarios(
          beneficiarios.map((ben) =>
            ben.id === editingId ? { ...ben, ...newBeneficiary } : ben
          )
        );
        Alert.alert("Éxito", "Beneficiario actualizado correctamente.");
      } else {
        const docRef = await addDoc(collection(db, "beneficiarios"), newBeneficiary);
        setBeneficiarios([...beneficiarios, { id: docRef.id, ...newBeneficiary }]);
        Alert.alert("Éxito", "Beneficiario añadido correctamente.");
      }
      resetForm();
    } catch (error) {
      console.error("Error al agregar/actualizar beneficiario: ", error);
      Alert.alert("Error", "No se pudo agregar/actualizar el beneficiario.");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setProfileImage(null);
    setEditingId(null);
  };

  const handleDeleteBeneficiary = async (id) => {
    try {
      await deleteDoc(doc(db, "beneficiarios", id));
      setBeneficiarios(beneficiarios.filter((ben) => ben.id !== id));
      Alert.alert("Éxito", "Beneficiario eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar beneficiario: ", error);
      Alert.alert("Error", "No se pudo eliminar el beneficiario.");
    }
  };

  const handleEditBeneficiary = (beneficiary) => {
    setName(beneficiary.name);
    setEmail(beneficiary.email);
    setPhone(beneficiary.phone || "");
    setProfileImage(beneficiary.profileImage || null);
    setEditingId(beneficiary.id);
  };

  const filteredBeneficiarios = beneficiarios.filter((ben) =>
    ben.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loading} />
    );

  return (
    <ImageBackground
      source={require("../../assets/background/config.webp")}
      style={styles.backgroundImage}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Beneficiarios</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666666"
        />

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
            placeholderTextColor="#666666"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo Electrónico"
            keyboardType="email-address"
            placeholderTextColor="#666666"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Teléfono (opcional)"
            keyboardType="phone-pad"
            placeholderTextColor="#666666"
          />
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <MaterialIcons name="photo-camera" size={24} color="#FFFFFF" />
            <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
          </TouchableOpacity>
          {profileImage && (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddOrUpdateBeneficiary}
            disabled={uploading} // Desactivar botón mientras se sube
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <MaterialIcons
                  name={editingId ? "edit" : "add"}
                  size={24}
                  color="#FFFFFF"
                />
                <Text style={styles.buttonText}>
                  {editingId ? "Actualizar" : "Añadir"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {filteredBeneficiarios.map((beneficiary) => (
          <View key={beneficiary.id} style={styles.card}>
            <Image
              source={{
                uri: beneficiary.profileImage || "https://via.placeholder.com/80",
              }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{beneficiary.name}</Text>
              <Text style={styles.cardEmail}>{beneficiary.email}</Text>
              {beneficiary.phone ? (
                <Text style={styles.cardPhone}>{beneficiary.phone}</Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEditBeneficiary(beneficiary)}
                style={styles.cardIcon}
                accessibilityLabel="Editar Beneficiario"
              >
                <MaterialIcons name="edit" size={24} color="#555555" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteBeneficiary(beneficiary.id)}
                style={styles.cardIcon}
                accessibilityLabel="Eliminar Beneficiario"
              >
                <MaterialIcons name="delete" size={24} color="#FF5555" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Overlay claro
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF", // Cambiar a blanco para mejor contraste
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC", // Bordes grises claros
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semi-transparente para mejor legibilidad
    color: "#333333", // Gris oscuro para texto
  },
  form: {
    marginBottom: 30,
  },
  imagePicker: {
    backgroundColor: "#555555", // Fondo más oscuro
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  imagePickerText: {
    color: "#FFFFFF", // Blanco para texto
    marginLeft: 10,
    fontWeight: "bold",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#CCCCCC", // Borde gris claro
  },
  addButton: {
    backgroundColor: "#333333", // Fondo más oscuro
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#FFFFFF", // Blanco para texto
    marginLeft: 10,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo semi-transparente
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000", // Sombra negra
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#CCCCCC", // Borde gris claro
  },
  cardText: {
    flex: 1,
  },
  cardName: {
    color: "#333333", // Gris oscuro
    fontWeight: "bold",
    fontSize: 16,
  },
  cardEmail: {
    color: "#666666", // Gris medio
    fontSize: 14,
  },
  cardPhone: {
    color: "#666666",
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIcon: {
    marginHorizontal: 5,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Beneficiarios;
