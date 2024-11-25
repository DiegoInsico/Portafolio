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
import { db } from "../../utils/firebase";
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
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

    const newBeneficiary = { name, email, phone, profileImage, userId };

    try {
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
        />

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo Electrónico"
          />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Teléfono (opcional)"
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <MaterialIcons name="photo-camera" size={24} color="#FFFFFF" />
            <Text style={styles.imagePickerText}>Seleccionar Imagen</Text>
          </TouchableOpacity>
          {profileImage && (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddOrUpdateBeneficiary}
          >
            <MaterialIcons
              name={editingId ? "edit" : "add"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.buttonText}>
              {editingId ? "Actualizar" : "Añadir"}
            </Text>
          </TouchableOpacity>
        </View>

        {filteredBeneficiarios.map((beneficiary) => (
          <View key={beneficiary.id} style={styles.card}>
            <Image
              source={{
                uri: beneficiary.profileImage || "https://via.placeholder.com/80",
              }}
              style={styles.cardImage}
            />
            <View style={styles.cardText}>
              <Text style={styles.cardName}>{beneficiary.name}</Text>
              <Text style={styles.cardEmail}>{beneficiary.email}</Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={() => handleEditBeneficiary(beneficiary)}
              >
                <MaterialIcons name="edit" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteBeneficiary(beneficiary.id)}
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
    color: "#333333", // Gris oscuro
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC", // Bordes grises claros
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#FFFFFF", // Blanco puro
    color: "#333333", // Gris oscuro para texto
  },
  form: {
    marginBottom: 30,
  },
  imagePicker: {
    backgroundColor: "#EFEFEF", // Fondo gris claro
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  imagePickerText: {
    color: "#333333", // Gris oscuro
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
    backgroundColor: "#555555", // Negro suave
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
    backgroundColor: "#FFFFFF", // Blanco puro
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
