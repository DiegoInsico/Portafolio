// src/screens/midespedida/MiDespedidaScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { TextInput, Button, IconButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Video } from "expo-av";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Importar MaterialIcons
import { Audio } from 'expo-av'; // Importar Audio para permisos
import SectionedMultiSelect from 'react-native-sectioned-multi-select'; // Importar multi-select

const screenWidth = Dimensions.get('window').width;

const MiDespedidaScreen = () => {
  const [localVideo, setLocalVideo] = useState(null); // Video seleccionado o grabado
  const [uploadedVideoURL, setUploadedVideoURL] = useState(null); // URL del video subido
  const [message, setMessage] = useState("");
  const [selectedBeneficiarios, setSelectedBeneficiarios] = useState([]); // Beneficiarios seleccionados (ids)
  const [uploading, setUploading] = useState(false);
  const [existingDespedida, setExistingDespedida] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState([]); // Lista de beneficiarios desde Firestore

  const auth = getAuth();
  const storage = getStorage();
  const userId = auth.currentUser.uid;

  // Función para convertir URI a Blob usando XMLHttpRequest
  const uriToBlob = async (uri) => {
    if (!uri) {
      throw new Error("La URI del video está vacía o indefinida.");
    }

    console.log("Convirtiendo URI a Blob:", uri);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        resolve(xhr.response);
      };
      xhr.onerror = () => {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };

  // Función para recuperar beneficiarios desde Firestore
  const fetchBeneficiarios = async () => {
    try {
      const beneficiariosRef = collection(db, "beneficiarios");
      const q = query(beneficiariosRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const beneficiariosList = querySnapshot.docs.map(doc => ({
        id: doc.id, // Usar el ID del documento como id
        name: doc.data().name, // Usar el nombre del beneficiario
        email: doc.data().email, // Almacenar el email para mapeo posterior
      }));
      setBeneficiarios(beneficiariosList);
    } catch (error) {
      console.error("Error al obtener beneficiarios:", error);
      Alert.alert("Error", "Hubo un problema al obtener tus beneficiarios.");
    }
  };

  // Recuperar beneficiarios al montar el componente
  useEffect(() => {
    fetchBeneficiarios();
  }, []);

  // Cargar la despedida existente si la hay
  useEffect(() => {
    const fetchDespedida = async () => {
      try {
        const despedidaDoc = await getDoc(doc(db, "despedidas", userId));
        if (despedidaDoc.exists()) {
          const data = despedidaDoc.data();
          setExistingDespedida(data);
          if (data.videoURL) {
            setUploadedVideoURL(data.videoURL);
          }
          setMessage(data.message);
          if (data.beneficiarioEmails && Array.isArray(data.beneficiarioEmails)) {
            // Mapear emails a ids
            const selectedIds = beneficiarios
              .filter(b => data.beneficiarioEmails.includes(b.email))
              .map(b => b.id);
            setSelectedBeneficiarios(selectedIds);
          }
        }
      } catch (error) {
        console.error("Error al obtener la despedida del usuario:", error);
      }
    };

    // Asegurarse de que los beneficiarios ya están cargados antes de buscar la despedida
    if (beneficiarios.length > 0) {
      fetchDespedida();
    }
  }, [beneficiarios]);

  // Función para subir el video y el mensaje a Firebase
  const uploadDespedida = async () => {
    if (!localVideo || !localVideo.uri) {
      Alert.alert("Error", "Por favor, selecciona un video.");
      return;
    }

    if (!message.trim()) {
      Alert.alert("Error", "Por favor, escribe un mensaje de despedida.");
      return;
    }

    if (selectedBeneficiarios.length === 0) {
      Alert.alert("Error", "Por favor, selecciona al menos un beneficiario.");
      return;
    }

    setUploading(true);

    try {
      console.log("Iniciando subida del video...");
      console.log("URI del video seleccionado:", localVideo.uri);

      // Validación del tamaño del video (opcional)
      const maxSize = 50 * 1024 * 1024; // 50MB
      const blob = await uriToBlob(localVideo.uri);

      console.log("Tamaño del blob:", blob.size);

      if (blob.size > maxSize) {
        Alert.alert("Error", "El tamaño del video excede el límite permitido de 50MB.");
        setUploading(false);
        return;
      }

      // Subir el Blob a Firebase Storage
      const storageRef = ref(storage, `despedidas/${userId}/video.mp4`);
      console.log("Subiendo el blob a Firebase Storage...");
      await uploadBytes(storageRef, blob);

      // Obtener la URL de descarga del video
      const downloadURL = await getDownloadURL(storageRef);
      console.log("URL de descarga obtenida:", downloadURL);

      // Obtener los correos electrónicos de los beneficiarios seleccionados
      const beneficiarioEmails = beneficiarios
        .filter(b => selectedBeneficiarios.includes(b.id))
        .map(b => b.email);

      // Crear o actualizar el documento de despedida en Firestore
      const despedidaRef = doc(db, "despedidas", userId);
      await setDoc(
        despedidaRef,
        {
          userId: userId, // Asignar automáticamente el userId
          beneficiarioEmails: beneficiarioEmails, // Array de correos de beneficiarios
          videoURL: downloadURL,
          message: message.trim(),
          timestamp: serverTimestamp(),
        },
        { merge: true } // Merge para actualizar campos existentes
      );

      Alert.alert(
        "Éxito",
        `Tu despedida ha sido ${existingDespedida ? "actualizada" : "guardada"} exitosamente.`
      );

      // Actualizar el estado con la despedida existente
      const updatedDespedida = {
        userId: userId,
        beneficiarioEmails: beneficiarioEmails,
        videoURL: downloadURL,
        message: message.trim(),
        timestamp: serverTimestamp(),
      };
      setExistingDespedida(updatedDespedida);
      setUploadedVideoURL(downloadURL);
      setMessage("");
      setSelectedBeneficiarios([]); // Limpiar selección
      setLocalVideo(null);
    } catch (error) {
      console.error("Error al subir la despedida:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar tu despedida. Inténtalo de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  // Función para seleccionar o grabar un video
  const pickVideo = async () => {
    try {
      // Solicitar permisos
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync(); // Solicitud correcta de permisos de audio

      if (mediaStatus !== "granted" || cameraStatus !== "granted" || audioStatus !== "granted") {
        Alert.alert(
          "Permiso denegado",
          "Necesitamos permisos para acceder a tu cámara, galería de medios y micrófono."
        );
        return;
      }

      // Mostrar opciones para seleccionar o grabar video
      Alert.alert(
        "Seleccionar Video",
        "¿Cómo te gustaría obtener tu video de despedida?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Seleccionar de la Galería",
            onPress: async () => {
              try {
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                  quality: 1,
                });

                if (!result.cancelled && result.assets && result.assets.length > 0) {
                  const selectedAsset = result.assets[0];
                  console.log("Selected asset:", selectedAsset);
                  if (!selectedAsset.uri) {
                    Alert.alert("Error", "La URI del video está vacía o indefinida.");
                    return;
                  }
                  setLocalVideo(selectedAsset);
                  // No subimos automáticamente
                }
              } catch (error) {
                console.error("Error al seleccionar el video:", error);
                Alert.alert("Error", "Hubo un problema al seleccionar el video. Inténtalo de nuevo.");
              }
            },
          },
          {
            text: "Grabar Video",
            onPress: async () => {
              try {
                let result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                  allowsEditing: true,
                  quality: 1,
                  videoQuality: "high", // Reemplazado por "high"
                });

                if (!result.cancelled && result.assets && result.assets.length > 0) {
                  const selectedAsset = result.assets[0];
                  console.log("Selected asset:", selectedAsset);
                  if (!selectedAsset.uri) {
                    Alert.alert("Error", "La URI del video está vacía o indefinida.");
                    return;
                  }
                  setLocalVideo(selectedAsset);
                  // No subimos automáticamente
                }
              } catch (error) {
                console.error("Error al grabar el video:", error);
                Alert.alert("Error", "Hubo un problema al grabar el video. Inténtalo de nuevo.");
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error en pickVideo:", error);
      Alert.alert("Error", "Hubo un problema al intentar seleccionar o grabar el video.");
    }
  };

  // Función para manejar la cancelación
  const handleCancel = () => {
    setLocalVideo(null);
    setUploadedVideoURL(null);
    setMessage("");
    setSelectedBeneficiarios([]);
    setModalVisible(false);
  };

  // Renderizar el componente
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/images/fondo-despedida.webp")} // Asegúrate de tener esta imagen en tu proyecto
        style={styles.background}
      >
        {/* Capa negra semitransparente */}
        <View style={styles.overlay} />

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Mi Despedida</Text>

          {/* Botón para seleccionar o grabar video */}
          <TouchableOpacity style={styles.videoContainer} onPress={pickVideo}>
            {uploadedVideoURL || (localVideo && localVideo.uri) ? (
              <Video
                source={{ uri: uploadedVideoURL || localVideo.uri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay={false}
                useNativeControls
                style={styles.video}
              />
            ) : (
              <View style={styles.placeholder}>
                <MaterialIcons name="video-camera" size={50} color="#888" />
                <Text style={styles.placeholderText}>Selecciona o Graba un Video</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Campo de texto para el mensaje de despedida */}
          <View style={styles.textInputContainer}>
            <TextInput
              label="Mensaje de Despedida"
              value={message}
              onChangeText={setMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              right={<TextInput.Icon name="message-text" />}
              scrollEnabled={true} // Habilita el scroll interno
              textAlignVertical="top" // Alinea el texto en la parte superior
            />
          </View>

          {/* Selección de Beneficiarios */}
          <View style={styles.multiSelectContainer}>
            <SectionedMultiSelect
              IconRenderer={MaterialIcons} // Proporcionar el IconRenderer correctamente
              items={[
                {
                  name: 'Beneficiarios',
                  id: 0,
                  children: beneficiarios.map(b => ({ id: b.id, name: b.name })),
                },
              ]}
              uniqueKey="id"
              subKey="children"
              selectText="Selecciona Beneficiarios..."
              searchPlaceholderText="Buscar Beneficiarios..."
              showDropDowns={true}
              readOnlyHeadings={true}
              onSelectedItemsChange={(selected) => setSelectedBeneficiarios(selected)}
              selectedItems={selectedBeneficiarios}
              styles={{
                selectToggle: styles.selectToggle,
                chipsWrapper: styles.chipsWrapper,
                chip: styles.chip,
                chipText: styles.chipText,
                selectedItemText: styles.selectedItemText,
                searchBar: styles.searchBar,
              }}
            />
          </View>

          {/* Botón para subir/actualizar la despedida */}
          {uploading ? (
            <ActivityIndicator size="large" color="#758E4F" style={styles.loader} />
          ) : (
            <Button
              mode="contained"
              onPress={uploadDespedida}
              style={styles.button}
              icon={() => <MaterialIcons name="upload" size={20} color="#fff" />}
            >
              {existingDespedida ? "Actualizar Despedida" : "Guardar Despedida"}
            </Button>
          )}

          {/* Botón para cancelar */}
          <Button
            mode="outlined"
            onPress={() => setModalVisible(true)}
            style={styles.cancelButton}
            icon={() => <MaterialIcons name="close" size={20} color="#333" />}
          >
            Cancelar
          </Button>
        </ScrollView>

        {/* Modal para confirmar la cancelación */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalText}>¿Estás seguro que deseas cancelar?</Text>
                <View style={styles.modalButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                    icon={() => <MaterialIcons name="close" size={16} color="#333" />}
                  >
                    No
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleCancel}
                    style={styles.modalButton}
                    icon={() => <MaterialIcons name="check" size={16} color="#fff" />}
                  >
                    Sí
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f0f4f8", // Fondo suave y elegante
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // Capa negra con opacidad
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
    fontFamily: 'Georgia',
  },
  videoContainer: {
    width: screenWidth * 0.9,
    height: 250,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  placeholderText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
    fontFamily: 'Georgia',
  },
  textInputContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "transparent", // Hereda el fondo del contenedor
    fontFamily: 'Georgia',
  },
  multiSelectContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 5,
    padding: 10,
  },
  selectToggle: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    fontFamily: 'Georgia',
  },
  chipsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
    backgroundColor: '#758E4F',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  selectedItemText: {
    color: '#758E4F',
    fontFamily: 'Georgia',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#758E4F",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '90%',
    alignSelf: 'center',
  },
  cancelButton: {
    borderColor: "#fff",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "transparent",
    width: '90%',
    alignSelf: 'center',
  },
  loader: {
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
    fontFamily: 'Georgia',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default MiDespedidaScreen;
