import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './../../../utils/firebase'; // Asegúrate de tener la configuración correcta de Firebase.
import styles from './../../../components/styles'; // Importar estilos.

const AgregarTest = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [circuloCercano, setCirculoCercano] = useState('');
  const [foto, setFoto] = useState(null); // Guardamos la URI de la imagen
  const [imageUrl, setImageUrl] = useState('');

  // Función para manejar la selección de la imagen
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.uri); // Guardamos la URI de la imagen seleccionada
    }
  };

  const subirImagenAFirebase = async (uri) => {
    try {
      const storage = getStorage();
      const response = await fetch(uri);
      const blob = await response.blob(); // Convertimos la imagen a un blob para subirla
      const imageRef = ref(storage, `fotosTestigos/${nombre}_${Date.now()}`);
      await uploadBytes(imageRef, blob);
      const downloadUrl = await getDownloadURL(imageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      Alert.alert('Error', 'Hubo un problema al subir la imagen.');
      return null;
    }
  };

  const agregarTestigo = async () => {
    if (!nombre || !correo || !telefono || !circuloCercano) {
      Alert.alert('Error', 'Por favor ingresa todos los campos.');
      return;
    }

    try {
      const urlImagen = foto ? await subirImagenAFirebase(foto) : '';
      await addDoc(collection(db, 'testigos'), {
        nombre,
        correo,
        telefono,
        circuloCercano,
        fotoUrl: urlImagen, // Guardamos la URL de la imagen en Firestore
        timestamp: new Date(),
      });
      Alert.alert('Éxito', 'Testigo agregado correctamente.');
      navigation.navigate('AdminTesti'); // Redirigir a la lista de testigos.
    } catch (error) {
      console.error('Error al agregar testigo:', error);
      Alert.alert('Error', 'Hubo un problema al agregar el testigo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Testigo</Text>

      {/* Campo de texto para el nombre */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del Testigo"
        value={nombre}
        onChangeText={setNombre}
      />

      {/* Campo de texto para el correo */}
      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
      />

      {/* Campo de texto para el teléfono */}
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
      />

      {/* Campo de texto para el círculo cercano */}
      <TextInput
        style={styles.input}
        placeholder="Círculo Cercano (ej: Familia, Amigos)"
        value={circuloCercano}
        onChangeText={setCirculoCercano}
      />

      {/* Botón para seleccionar una imagen */}
      <TouchableOpacity style={styles.buttonF} onPress={pickImage}>
        <Text style={styles.buttonTextF}>Seleccionar Foto</Text>
      </TouchableOpacity>

      {/* Vista previa de la imagen seleccionada */}
      {foto && (
        <Image
          source={{ uri: foto }}
          style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }}
        />
      )}

      {/* Botón para agregar el testigo */}
      <TouchableOpacity style={styles.buttonF} onPress={agregarTestigo}>
        <Text style={styles.buttonTextF}>Agregar Testigo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AgregarTest;
