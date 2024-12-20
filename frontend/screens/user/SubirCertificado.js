// src/screens/certificado/SubirCertificado.js

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { db, storage } from '../../utils/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from '../../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import PropTypes from 'prop-types';
import * as FileSystem from 'expo-file-system'; // Importar FileSystem para manejar archivos

const SubirCertificado = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log("Authenticated user:", user); // Para depuración

  // Helper function to convert URI to Blob
  const uriToBlob = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };

  // Función para seleccionar el documento (imagen o PDF)
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true, // Cambiar de false a true
      });
      console.log("DocumentPicker result:", result); // Para depuración
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log("Selected file:", selectedAsset); // Para depuración
        
        // Verificar que el nombre y la URI están presentes
        let fileName = selectedAsset.name;
        if (!fileName) {
          const uriParts = selectedAsset.uri.split('/');
          fileName = uriParts[uriParts.length - 1];
        }
        console.log("Selected file name:", fileName); // Para depuración

        setFile({ ...selectedAsset, name: fileName });
      }
    } catch (error) {
      console.log("Error al seleccionar el documento:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el documento.");
    }
  };

  // Función para subir el certificado
  const uploadCertificate = async () => {
    if (!file) {
      Alert.alert('Error', 'Por favor selecciona un archivo.');
      return;
    }

    setLoading(true);
    console.log("Uploading file:", file); // Para depuración

    try {
      const blob = await uriToBlob(file.uri);
      const fileName = `${Date.now()}_${file.name}`;
      console.log("Uploading to Firebase Storage as:", fileName); // Para depuración
      const storageRef = ref(storage, `certificados/${user.uid}/${fileName}`);
      await uploadBytes(storageRef, blob);
      const fileUrl = await getDownloadURL(storageRef);
      console.log("File uploaded successfully:", fileUrl); // Para depuración

      // Reemplazar 'ID_REAL_DEL_TESTIGO' con el ID real del testigo principal
      const testigoId = 'ID_REAL_DEL_TESTIGO'; // Implementa la lógica para obtener este ID

      // Agregar el documento en Firestore
      await addDoc(collection(db, 'certificados'), {
        userId: user.uid,
        testigoId: testigoId, // Usa el ID real del testigo
        fileName: file.name,
        filePath: storageRef.fullPath,
        fileUrl: fileUrl,
        status: 'pending',
        createdAt: Timestamp.fromDate(new Date()),
      });
      console.log("Firestore document created successfully."); // Para depuración

      Alert.alert('Éxito', 'Certificado subido correctamente.');
      setFile(null);
      navigation.goBack();
    } catch (error) {
      console.error('Error al subir el certificado:', error);
      Alert.alert('Error', 'No se pudo subir el certificado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={require('../../assets/background/certificado.jpg')} // Asegúrate de tener esta imagen en tu carpeta assets
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Superposición para mejorar la legibilidad */}
          <View style={styles.overlay} />
          <View style={styles.content}>
            <Text style={styles.title}>Subir Certificado de Defunción</Text>

            {/* Seleccionar Documento */}
            <TouchableOpacity style={styles.documentButton} onPress={pickDocument}>
              <MaterialIcons name="attach-file" size={30} color="#FFD700" />
              <Text style={styles.documentButtonText}>Seleccionar Documento</Text>
            </TouchableOpacity>

            {/* Vista Previa del Documento */}
            {file && (
              <View style={styles.documentPreview}>
                <Text style={styles.fileName}>{file.name}</Text>
              </View>
            )}

            {/* Botón para Subir Certificado */}
            <TouchableOpacity style={styles.uploadButton} onPress={uploadCertificate} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#1E1E1E" />
              ) : (
                <Text style={styles.uploadButtonText}>Subir Certificado</Text>
              )}
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

// Validación de Props usando PropTypes
SubirCertificado.propTypes = {
  navigation: PropTypes.object.isRequired,
};

// Definición de estilos específicos para SubirCertificado
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Fondo oscuro para contraste
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Superposición semi-transparente para mejorar la legibilidad
  },
  content: {
    padding: 20,
    alignItems: "center",
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700", // Color dorado
    marginBottom: 20,
    alignSelf: 'flex-start',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.8)', // Fondo dorado semi-transparente
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  documentButtonText: {
    color: "#1E1E1E", // Texto oscuro para contraste
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  documentPreview: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  fileName: {
    color: "#1E1E1E",
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: "#FFD700", // Fondo dorado
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#1E1E1E',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SubirCertificado;
