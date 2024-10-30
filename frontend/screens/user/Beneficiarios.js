import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { db, storage } from "../../utils/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";

const Beneficiarios = () => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBeneficiarios = async () => {
      const querySnapshot = await getDocs(collection(db, "beneficiarios"));
      const beneficiariosList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBeneficiarios(beneficiariosList);
    };
    fetchBeneficiarios();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const handleAddOrUpdateBeneficiary = async () => {
    if (!email || !name) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
      return;
    }
    const newBeneficiary = { name, email, phone, profileImage };
    if (editingId) {
      const beneficiaryRef = doc(db, "beneficiarios", editingId);
      await updateDoc(beneficiaryRef, newBeneficiary);
      setBeneficiarios(beneficiarios.map((ben) => ben.id === editingId ? { ...ben, ...newBeneficiary } : ben));
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
  };

  const handleEditBeneficiary = (beneficiary) => {
    setName(beneficiary.name);
    setEmail(beneficiary.email);
    setPhone(beneficiary.phone);
    setProfileImage(beneficiary.profileImage);
    setEditingId(beneficiary.id);
  };

  const handleDeleteBeneficiary = async (id) => {
    await deleteDoc(doc(db, "beneficiarios", id));
    setBeneficiarios(beneficiarios.filter((ben) => ben.id !== id));
    Alert.alert("Éxito", "Beneficiario eliminado correctamente.");
  };

  const filteredBeneficiarios = beneficiarios.filter((ben) =>
    ben.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
          <Text>{beneficiary.name} - {beneficiary.email}</Text>
          <View style={styles.buttonGroup}>
            <Button title="Editar" onPress={() => handleEditBeneficiary(beneficiary)} />
            <Button title="Eliminar" color="red" onPress={() => handleDeleteBeneficiary(beneficiary.id)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      backgroundColor: "#2C3E50",
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
      shadowRadius: 3,
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
