import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { db, storage } from "../../utils/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Testigos = () => {
  const [testigos, setTestigos] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const testigosRef = collection(db, "testigos");

  useEffect(() => {
    const fetchTestigos = async () => {
      try {
        const snapshot = await getDocs(testigosRef);
        const testigosList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTestigos(testigosList);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los testigos:", error);
      }
    };
    fetchTestigos();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleAddOrUpdateTestigo = async () => {
    if (!name || !email) {
      Alert.alert("Error", "El nombre y el correo electrónico son obligatorios.");
      return;
    }
    try {
      let imageUrl = null;
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `testigos/${Date.now()}_${name}`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      }
      const newTestigo = { name, email, phone, imageUrl };
      if (editingId) {
        const testigoRef = doc(db, "testigos", editingId);
        await updateDoc(testigoRef, newTestigo);
        setTestigos(testigos.map((testigo) => testigo.id === editingId ? { ...testigo, ...newTestigo } : testigo));
        Alert.alert("Éxito", "Testigo actualizado correctamente.");
      } else {
        const docRef = await addDoc(testigosRef, newTestigo);
        setTestigos([...testigos, { id: docRef.id, ...newTestigo }]);
        Alert.alert("Éxito", "Testigo agregado correctamente.");
      }
      setName("");
      setEmail("");
      setPhone("");
      setImage(null);
      setEditingId(null);
    } catch (error) {
      console.error("Error al guardar el testigo:", error);
      Alert.alert("Error", "Ocurrió un problema al guardar el testigo.");
    }
  };

  const handleEditTestigo = (testigo) => {
    setName(testigo.name);
    setEmail(testigo.email);
    setPhone(testigo.phone);
    setImage(testigo.imageUrl);
    setEditingId(testigo.id);
  };

  const handleDeleteTestigo = async (id) => {
    try {
      await deleteDoc(doc(db, "testigos", id));
      setTestigos(testigos.filter((testigo) => testigo.id !== id));
      Alert.alert("Éxito", "Testigo eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar el testigo:", error);
      Alert.alert("Error", "Ocurrió un problema al eliminar el testigo.");
    }
  };

  const filteredTestigos = testigos.filter((testigo) =>
    testigo.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />;

  return (
    <ImageBackground source={require("../../assets/background/config.jpg")} style={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Gestión de Testigos</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nombre"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.form}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre del testigo" />
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo electrónico" keyboardType="email-address" />
          <Text style={styles.label}>Teléfono (opcional)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Número de teléfono" keyboardType="phone-pad" />
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Text style={styles.imagePickerText}>Seleccionar imagen (opcional)</Text>
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          </TouchableOpacity>
          <Button title={editingId ? "Actualizar Testigo" : "Agregar Testigo"} onPress={handleAddOrUpdateTestigo} />
        </View>

        <Text style={styles.subheader}>Lista de Testigos</Text>
        {filteredTestigos.map((testigo) => (
          <View key={testigo.id} style={styles.card}>
            <Text style={styles.name}>{testigo.name}</Text>
            <Text style={styles.email}>{testigo.email}</Text>
            {testigo.phone && <Text style={styles.phone}>Teléfono: {testigo.phone}</Text>}
            {testigo.imageUrl && <Image source={{ uri: testigo.imageUrl }} style={styles.imagePreview} />}
            <View style={styles.buttonGroup}>
              <Button title="Editar" onPress={() => handleEditTestigo(testigo)} color="#4CAF50" />
              <Button title="Eliminar" color="red" onPress={() => handleDeleteTestigo(testigo.id)} />
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
    paddingTop: 70, // Igual que headerStyle.height
    padding: 20,
    backgroundColor: "rgba(44, 62, 80, 0.5)", // Overlay oscuro para mejorar la legibilidad
  },
  header: {
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
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#FFD700",
  },
  imagePicker: {
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 8,
  },
  imagePickerText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 10,
  },
  subheader: {
    fontSize: 20,
    color: "#FFD700",
    fontWeight: "bold",
    marginVertical: 15,
  },
  card: {
    backgroundColor: "#4B4E6D",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  name: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#F0E4C2",
  },
  phone: {
    fontSize: 14,
    color: "#F0E4C2",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
});

export default Testigos;
