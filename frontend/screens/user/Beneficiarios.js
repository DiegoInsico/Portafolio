import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { db, storage } from "../../utils/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import * as ImagePicker from "expo-image-picker";

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
        const beneficiariosList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setBeneficiarios(beneficiariosList);
      } catch (error) {
        console.error("Error al obtener beneficiarios: ", error);
      }
    };
    fetchBeneficiarios();
  }, [userId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
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
          beneficiarios.map((ben) => ben.id === editingId ? { ...ben, ...newBeneficiary } : ben)
        );
        Alert.alert("Éxito", "Beneficiario actualizado correctamente.");
      } else {
        const docRef = await addDoc(collection(db, "beneficiarios"), newBeneficiary);
        setBeneficiarios([...beneficiarios, { id: docRef.id, ...newBeneficiary }]);
        Alert.alert("Éxito", "Beneficiario añadido correctamente.");
      }
      setName("");
      setEmail("");
      setPhone("");
      setProfileImage(null);
      setEditingId(null);
    } catch (error) {
      console.error("Error al agregar/actualizar beneficiario: ", error);
      Alert.alert("Error", "No se pudo agregar/actualizar el beneficiario.");
    }
  };

  const handleEditBeneficiary = (beneficiary) => {
    if (beneficiary.userId !== userId) {
      Alert.alert("Error", "No tienes permiso para editar este beneficiario.");
      return;
    }
    setName(beneficiary.name);
    setEmail(beneficiary.email);
    setPhone(beneficiary.phone);
    setProfileImage(beneficiary.profileImage);
    setEditingId(beneficiary.id);
  };

  const handleDeleteBeneficiary = async (id) => {
    const beneficiaryToDelete = beneficiarios.find((ben) => ben.id === id);
    if (beneficiaryToDelete.userId !== userId) {
      Alert.alert("Error", "No tienes permiso para eliminar este beneficiario.");
      return;
    }
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

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Por favor, inicia sesión para gestionar tus beneficiarios.</Text>
      </View>
    );
  }

  return (
    <ImageBackground source={require("../../assets/background/config.jpg")} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Gestionar Beneficiarios</Text>
        <TextInput style={styles.input} placeholder="Buscar por nombre" value={searchQuery} onChangeText={setSearchQuery} />
        
        <View style={styles.form}>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo Electrónico" />
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Teléfono (opcional)" keyboardType="phone-pad" />
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Text style={styles.imagePickerText}>Seleccionar Imagen (opcional)</Text>
          </TouchableOpacity>
          {profileImage && <Image source={{ uri: profileImage }} style={styles.profileImage} />}
          <Button title={editingId ? "Actualizar Beneficiario" : "Añadir Beneficiario"} onPress={handleAddOrUpdateBeneficiary} />
        </View>

        {filteredBeneficiarios.map((beneficiary) => (
          <View key={beneficiary.id} style={styles.beneficiaryCard}>
            <Text style={styles.beneficiaryText}>{beneficiary.name} - {beneficiary.email}</Text>
            <View style={styles.buttonGroup}>
              <View style={styles.button}>
                <Button title="Editar" onPress={() => handleEditBeneficiary(beneficiary)} />
              </View>
              <View style={styles.button}>
                <Button title="Eliminar" color="red" onPress={() => handleDeleteBeneficiary(beneficiary.id)} />
              </View>
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
    paddingTop: 60,
    padding: 20,
    backgroundColor: "rgba(44, 62, 80, 0.5)", // Overlay oscuro para mejorar la legibilidad
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFD700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
    color: "#333",
  },
  form: {
    marginBottom: 30,
  },
  imagePicker: {
    backgroundColor: "#4B4E6D",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  beneficiaryCard: {
    backgroundColor: "#4B4E6D",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  beneficiaryText: {
    color: "#F0E4C2",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#FFF",
    color: "#333",
  },
});

export default Beneficiarios;
