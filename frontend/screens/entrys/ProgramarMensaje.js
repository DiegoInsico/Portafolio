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
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { AuthContext } from "../../context/AuthContext";
import PremiumMessage from "./../suscripcion/PremiumMessage";
import { COLORS } from "../../utils/colors";
import PropTypes from "prop-types";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from '../../utils/firebase';

const ProgramarMensaje = ({ navigation }) => {
  const { user, isPremium, loading } = useContext(AuthContext);
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>Debes iniciar sesión para acceder a esta funcionalidad.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.button}>
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isPremium) {
    return <PremiumMessage navigation={navigation} />;
  }

  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const beneficiariosCollection = collection(db, "beneficiarios");
        const beneficiariosSnapshot = await getDocs(beneficiariosCollection);
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
  }, []);

  const seleccionarVideo = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión para seleccionar un video.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setMedia(selectedAsset.uri);
        setMediaType(selectedAsset.type); // 'video'
        
        // Subir el video a Firebase
        await subirVideoAFirebase(selectedAsset.uri, user.email, new Date(), selectedAsset.type, user.uid);
      }
    } catch (error) {
      console.log("Error al seleccionar video:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el video.");
    }
  };

  const grabarVideo = async () => {
    try {
      if (!user) {
        Alert.alert("Error", "Debes iniciar sesión para grabar un video.");
        return;
      }

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
        await subirVideoAFirebase(recordedVideo.uri, user.email, new Date(), recordedVideo.type, user.uid);
      }
    } catch (error) {
      console.log("Error al grabar video:", error);
      Alert.alert("Error", "Hubo un problema al grabar el video.");
    }
  };

  const eliminarMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  // Función para subir el video a Firebase Storage y luego guardar la URL en Firestore
  const subirVideoAFirebase = async (uri, email, fechaEnvio, mediaType, userId) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Crear una referencia para el archivo en Firebase Storage
      const videoRef = ref(storage, `videos/${Date.now()}.mp4`);

      // Subir el archivo
      const uploadResult = await uploadBytes(videoRef, blob);
      
      // Obtener la URL de descarga
      const videoURL = await getDownloadURL(uploadResult.ref);

      // Ahora guardar el mensaje con la URL del video en Firestore
      const mensajeRef = collection(db, "mensajesProgramados");
      await addDoc(mensajeRef, {
        email,
        enviado: false,
        fechaEnvio,
        media: videoURL,
        mediaType,
        userId,
        beneficiarioId: selectedBeneficiary,  // Este es el beneficiarioId
      });

      console.log("Video subido y mensaje guardado en Firestore");
    } catch (error) {
      console.error("Error al subir video y guardar mensaje:", error);
      throw error;
    }
  };

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

  const resetStates = () => {
    setSelectedBeneficiary("");
    setDate(new Date());
    setMedia(null);
    setMediaType(null);
  };

  const handleConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const showDatePickerModal = () => {
    setIsDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={require("../../assets/background/mensaje.webp")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          <View style={styles.content}>
            <Text style={styles.title}>Programar Mensaje de Video</Text>
            <View style={styles.beneficiaryDateRow}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedBeneficiary}
                  onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                  style={styles.picker}
                  dropdownIconColor={COLORS.primary}
                >
                  <Picker.Item label="Selecciona un beneficiario" value="" />
                  {beneficiarios.map((beneficiary) => (
                    <Picker.Item key={beneficiary.id} label={beneficiary.name} value={beneficiary.id} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity onPress={showDatePickerModal} style={styles.dateIconContainer}>
                <MaterialIcons name="calendar-today" size={28} color={COLORS.primary} />
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
              <TouchableOpacity style={styles.videoButton} onPress={seleccionarVideo}>
                <MaterialIcons name="video-library" size={30} color={COLORS.surface} />
                <Text style={styles.videoButtonText}>Subir Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoButton} onPress={grabarVideo}>
                <MaterialIcons name="videocam" size={30} color={COLORS.surface} />
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
                  resizeMode="cover"
                  shouldPlay={false}
                  isLooping={false}
                  style={styles.mediaPreview}
                  useNativeControls
                />
                <TouchableOpacity style={styles.deleteButton} onPress={eliminarMedia}>
                  <MaterialIcons name="delete" size={24} color={COLORS.delete} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveMessage}>
                <Text style={styles.buttonText}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
};

// Validación de Props usando PropTypes
ProgramarMensaje.propTypes = {
  navigation: PropTypes.object.isRequired,
};

// Definición de estilos específicos para ProgramarMensaje
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 70,
  },
  container: {
    flexGrow: 1,
  },
  backgroundImage: {

    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.25)", // Overlay claro
  },
  content: {
    padding: 20,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 20,
    alignSelf: "flex-start",
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
  videoButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  videoButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
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
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.delete,
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ProgramarMensaje;
