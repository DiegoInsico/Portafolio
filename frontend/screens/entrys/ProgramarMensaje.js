// ProgramarMensaje.js

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ImageBackground,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, Timestamp, query, where } from "firebase/firestore";
import { MaterialIcons, Entypo } from "@expo/vector-icons"; // Importar más iconos
import { Video } from "expo-av";
import { AuthContext } from "../../context/AuthContext";
import PremiumMessage from "./../suscripcion/PremiumMessage";
import { COLORS } from "../../utils/colors";
import PropTypes from "prop-types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../utils/firebase";

const ProgramarMensaje = ({ navigation }) => {
  const { user, isPremium, loading } = useContext(AuthContext);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploading, setUploading] = useState(false); // Nuevo estado para manejar la carga

  // Mostrar indicador de carga mientras se obtienen los beneficiarios
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Mostrar mensaje si el usuario no está autenticado
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          Debes iniciar sesión para acceder a esta funcionalidad.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={styles.button}
        >
          <MaterialIcons name="login" size={24} color={COLORS.surface} />
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mostrar mensaje si el usuario no es premium
  if (!isPremium) {
    return <PremiumMessage navigation={navigation} />;
  }

  // useEffect para obtener beneficiarios filtrados por el usuario actual
  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const beneficiariosRef = collection(db, "beneficiarios");
        const q = query(beneficiariosRef, where("userId", "==", user.uid));
        const beneficiariosSnapshot = await getDocs(q);
        const beneficiariosList = beneficiariosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBeneficiarios(beneficiariosList);
      } catch (error) {
        console.error("Error al obtener beneficiarios:", error);
        Alert.alert("Error", "No se pudieron cargar los beneficiarios.");
      }
    };
    fetchBeneficiarios();
  }, [user.uid]);

  // Función para seleccionar un video desde la galería
  const seleccionarVideo = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setMedia(selectedAsset.uri);
        setMediaType(selectedAsset.type); // 'video'

        // Subir el video a Firebase
        await subirVideoAFirebase(
          selectedAsset.uri,
          user.email,
          new Date(),
          selectedAsset.type,
          user.uid
        );
      }
    } catch (error) {
      console.log("Error al seleccionar video:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el video.");
    }
  };

  // Función para grabar un video usando la cámara
  const grabarVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso necesario", "Se necesitan permisos para grabar video.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        const recordedVideo = result.assets[0];
        setMedia(recordedVideo.uri);
        setMediaType(recordedVideo.type); // 'video'

        // Subir el video a Firebase
        await subirVideoAFirebase(
          recordedVideo.uri,
          user.email,
          new Date(),
          recordedVideo.type,
          user.uid
        );
      }
    } catch (error) {
      console.log("Error al grabar video:", error);
      Alert.alert("Error", "Hubo un problema al grabar el video.");
    }
  };

  // Función para eliminar el video seleccionado
  const eliminarMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  // Función para subir el video a Firebase Storage y luego guardar la URL en Firestore
  const subirVideoAFirebase = async (uri, email, fechaEnvio, mediaType, userId) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();

      // Crear una referencia para el archivo en Firebase Storage
      const videoRef = ref(storage, `videos/${userId}/${Date.now()}.mp4`);

      // Subir el archivo
      const uploadResult = await uploadBytes(videoRef, blob);

      // Obtener la URL de descarga
      const videoURL = await getDownloadURL(uploadResult.ref);

      // Guardar el mensaje con la URL del video en Firestore
      const mensajeRef = collection(db, "mensajesProgramados");
      await addDoc(mensajeRef, {
        email,
        enviado: false,
        fechaEnvio,
        media: videoURL,
        mediaType,
        userId,
        beneficiarioId: selectedBeneficiary, // Beneficiario seleccionado
      });

      console.log("Video subido y mensaje guardado en Firestore");
      Alert.alert("Éxito", "Mensaje programado y video subido correctamente.");
      resetStates();
      navigation.goBack();
    } catch (error) {
      console.error("Error al subir video y guardar mensaje:", error);
      Alert.alert("Error", "No se pudo subir el video y programar el mensaje.");
    } finally {
      setUploading(false);
    }
  };

  // Función para manejar el guardado del mensaje programado
  const handleSaveMessage = async () => {
    if (!selectedBeneficiary || !media) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    const selectedBeneficiaryData = beneficiarios.find(
      (b) => b.id === selectedBeneficiary
    );

    if (!selectedBeneficiaryData) {
      Alert.alert("Error", "No se ha encontrado un beneficiario con el ID seleccionado.");
      return;
    }

    const email = selectedBeneficiaryData.email;

    if (!email) {
      Alert.alert("Error", "El beneficiario seleccionado no tiene un correo electrónico asociado.");
      return;
    }

    try {
      await addDoc(collection(db, "mensajesProgramados"), {
        userId: user.uid,
        beneficiarioId: selectedBeneficiary,
        email: email,
        fechaEnvio: Timestamp.fromDate(date),
        media: media,
        mediaType: mediaType,
        enviado: false,
      });
      Alert.alert("Éxito", "Mensaje programado correctamente.");
      resetStates();
      navigation.goBack();
    } catch (error) {
      console.error("Error al programar el mensaje:", error);
      Alert.alert("Error", "No se pudo programar el mensaje.");
    }
  };

  // Función para resetear los estados después de una acción
  const resetStates = () => {
    setSelectedBeneficiary("");
    setDate(new Date());
    setMedia(null);
    setMediaType(null);
  };

  // Función para manejar la confirmación de la fecha seleccionada
  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  // Funciones para mostrar y ocultar el selector de fecha
  const showDatePickerModal = () => {
    setIsDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../../assets/background/mensaje.webp")}
        style={styles.backgroundImage}
        resizeMode="cover" // Usar 'cover' para que el fondo cubra toda la pantalla
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Programar Mensaje de Video</Text>
            <View style={styles.beneficiaryDateRow}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedBeneficiary}
                  onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.primary}
                  mode="dropdown"
                >
                  <Picker.Item label="Selecciona un beneficiario" value="" />
                  {beneficiarios.map((beneficiary) => (
                    <Picker.Item
                      key={beneficiary.id}
                      label={beneficiary.name}
                      value={beneficiary.id}
                    />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                onPress={showDatePickerModal}
                style={styles.dateIconContainer}
                accessibilityLabel="Seleccionar Fecha de Envío"
              >
                <MaterialIcons
                  name="calendar-today"
                  size={28}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
              />
            </View>
            <Text style={styles.label}>Selecciona o graba un video:</Text>
            <View style={styles.videoButtonsContainer}>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={seleccionarVideo}
                accessibilityLabel="Subir Video"
              >
                <MaterialIcons
                  name="video-library"
                  size={30}
                  color={COLORS.surface}
                />
                <Text style={styles.videoButtonText}>Subir Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.videoButton}
                onPress={grabarVideo}
                accessibilityLabel="Grabar Video"
              >
                <MaterialIcons
                  name="videocam"
                  size={30}
                  color={COLORS.surface}
                />
                <Text style={styles.videoButtonText}>Grabar Video</Text>
              </TouchableOpacity>
            </View>

            {media && mediaType === "video" && (
              <View style={styles.mediaContainer}>
                <Video
                  source={{ uri: media }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="contain" // Cambiar a 'contain' para mostrar el video completo
                  shouldPlay={false}
                  isLooping={false}
                  style={styles.mediaPreview}
                  useNativeControls
                />
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={eliminarMedia}
                  accessibilityLabel="Eliminar Video"
                >
                  <MaterialIcons name="delete" size={24} color={COLORS.delete} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveMessage}
                disabled={uploading} // Desactivar botón mientras se sube
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <>
                    <MaterialIcons name="send" size={24} color={COLORS.surface} />
                    <Text style={styles.buttonText}>Enviar</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                accessibilityLabel="Cancelar"
              >
                <Entypo name="cross" size={24} color={COLORS.surface} />
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Validación de Props usando PropTypes
ProgramarMensaje.propTypes = {
  navigation: PropTypes.object.isRequired,
};

// Definición de estilos específicos para ProgramarMensaje
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center", // Centrar verticalmente
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)", // Fondo semi-transparente para mejorar legibilidad
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.surface,
    marginBottom: 20,
    alignSelf: "center",
    textAlign: "center",
  },
  beneficiaryDateRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 3, // 75% del ancho
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  picker: {
    height: 50,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  dateIconContainer: {
    flex: 1, // 25% del ancho
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    height: 50,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    color: COLORS.surface,
    marginBottom: 10,
  },
  videoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  videoButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
    flexDirection: "column",
  },
  videoButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
    marginTop: 5,
  },
  mediaContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,0,0,0.7)", // Fondo rojo semi-transparente
    borderRadius: 20,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.delete,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    color: COLORS.surface,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
});

export default ProgramarMensaje;
