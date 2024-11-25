import React, { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { db, storage } from "../../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { AuthContext } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native"; // Importar useNavigation

const Testigos = () => {
  const navigation = useNavigation(); // Obtener navigation

  const [testigos, setTestigos] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useContext(AuthContext);

  const testigosRef = collection(db, "testigos");

  useEffect(() => {
    const fetchTestigos = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }
      try {
        // Crear una consulta para obtener solo los testigos del usuario actual
        const q = query(testigosRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const testigosList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTestigos(testigosList);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los testigos:", error);
        Alert.alert("Error", "No se pudieron cargar los testigos.");
        setLoading(false);
      }
    };
    fetchTestigos();
  }, [user]);

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
      Alert.alert(
        "Error",
        "El nombre y el correo electrónico son obligatorios."
      );
      return;
    }
    try {
      let imageUrl = null;
      if (image && !image.startsWith("https://")) { // Solo subir si es una URI local
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `testigos/${Date.now()}_${name}`);
        await uploadBytes(storageRef, blob);
        imageUrl = await getDownloadURL(storageRef);
      } else if (image && image.startsWith("https://")) {
        imageUrl = image; // Imagen ya subida
      }

      const newTestigo = { userId: user.uid, name, email, phone, imageUrl };
      if (editingId) {
        const testigoRef = doc(db, "testigos", editingId);
        await updateDoc(testigoRef, newTestigo);
        setTestigos(
          testigos.map((testigo) =>
            testigo.id === editingId ? { ...testigo, ...newTestigo } : testigo
          )
        );
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

  if (loading)
    return (
      <ActivityIndicator size="large" color="#FFD700" style={styles.loading} />
    );

  return (
    <ImageBackground
      source={require("../../assets/background/config.webp")}
      style={styles.backgroundImage}
    >
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
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre del testigo"
          />
          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Teléfono (opcional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Número de teléfono"
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
            <Text style={styles.imagePickerText}>
              Seleccionar imagen (opcional)
            </Text>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
          </TouchableOpacity>
          <Button
            title={editingId ? "Actualizar Testigo" : "Agregar Testigo"}
            onPress={handleAddOrUpdateTestigo}
          />
        </View>

        <TouchableOpacity
          style={styles.uploadCertificateButton}
          onPress={() => navigation.navigate("SubirCertificado")}
        >
          <Text style={styles.uploadCertificateButtonText}>
            Subir Certificado de Defunción
          </Text>
        </TouchableOpacity>

        <Text style={styles.subheader}>Lista de Testigos</Text>
        {filteredTestigos.map((testigo) => (
          <View key={testigo.id} style={styles.card}>
            <Text style={styles.name}>{testigo.name}</Text>
            <Text style={styles.email}>{testigo.email}</Text>
            {testigo.phone && (
              <Text style={styles.phone}>Teléfono: {testigo.phone}</Text>
            )}
            {testigo.imageUrl && (
              <Image
                source={{ uri: testigo.imageUrl }}
                style={styles.imagePreview}
              />
            )}
            <View style={styles.buttonGroup}>
              <Button
                title="Editar"
                onPress={() => handleEditTestigo(testigo)}
                color="#4CAF50"
              />
              <Button
                title="Eliminar"
                color="red"
                onPress={() => handleDeleteTestigo(testigo.id)}
              />
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
    paddingTop: 70,
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Overlay oscuro
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#FFFFFF", // Texto blanco
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#FFFFFF", // Fondo blanco
    fontSize: 16,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    padding: 10,
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  imagePickerText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  subheader: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginVertical: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#333333", // Fondo oscuro para tarjetas
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    color: "#FFFFFF", // Texto blanco
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#CCCCCC", // Texto gris claro
    marginBottom: 5,
  },
  phone: {
    fontSize: 14,
    color: "#AAAAAA", // Texto gris más oscuro
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  buttonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#444444", // Botón gris oscuro
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  buttonIconText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  uploadCertificateButton: {
    backgroundColor: "#444444", // Fondo gris oscuro
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  uploadCertificateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default Testigos;
