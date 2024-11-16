// ProgramarMensaje.js

import React, { useState, useEffect, useContext } from 'react';
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
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker";
import { db } from '../../utils/firebase';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { MaterialIcons } from "@expo/vector-icons";
import { Video } from 'expo-av';
import { AuthContext } from '../../context/AuthContext';
import PremiumMessage from './../suscripcion/PremiumMessage'; 
import { commonStyles } from '../../styles/commonStyles.js'; // Asegúrate de ajustar la ruta según tu estructura
import PropTypes from 'prop-types'; // Asegúrate de importar PropTypes

const ProgramarMensaje = ({ navigation }) => {
  const { user, isPremium, loading } = useContext(AuthContext);

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  // Mostrar indicador de carga mientras se verifica el estado premium
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          Debes iniciar sesión para acceder a esta funcionalidad.
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.button}>
          <Text style={styles.buttonText}>Ir a Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Verificar si el usuario es premium
  if (!isPremium) {
    return <PremiumMessage navigation={navigation} />;
  }

  // Continuar con la funcionalidad si es premium
  useEffect(() => {
    const fetchBeneficiarios = async () => {
      try {
        const beneficiariosCollection = collection(db, 'beneficiarios');
        const beneficiariosSnapshot = await getDocs(beneficiariosCollection);
        const beneficiariosList = beneficiariosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBeneficiarios(beneficiariosList);
      } catch (error) {
        console.error('Error al obtener beneficiarios:', error);
        Alert.alert('Error', 'No se pudieron cargar los beneficiarios.');
      }
    };
    fetchBeneficiarios();
  }, []);

  // Funciones para seleccionar video
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
      }
    } catch (error) {
      console.log("Error al seleccionar video:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el video.");
    }
  };

  // Funciones para grabar video
  const grabarVideo = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesitan permisos para grabar video.');
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

  const handleSaveMessage = async () => {
    if (!selectedBeneficiary || !media) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const selectedBeneficiaryData = beneficiarios.find(b => b.id === selectedBeneficiary);
    const email = selectedBeneficiaryData?.email;

    if (!email) {
      Alert.alert('Error', 'El beneficiario seleccionado no tiene un correo electrónico asociado.');
      return;
    }

    try {
      await addDoc(collection(db, 'mensajesProgramados'), {
        userId: user.uid,
        beneficiarioId: selectedBeneficiary,
        email: email,
        fechaEnvio: Timestamp.fromDate(date),
        media: media,
        mediaType: mediaType, // 'video'
        enviado: false,
      });
      Alert.alert('Éxito', 'Mensaje programado correctamente.');
      resetStates();
      navigation.goBack();
    } catch (error) {
      console.error('Error al programar el mensaje:', error);
      Alert.alert('Error', 'No se pudo programar el mensaje.');
    }
  };

  const resetStates = () => {
    setSelectedBeneficiary('');
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
          source={require('../../assets/background/mensaje.jpg')} // Asegúrate de tener esta imagen en tu carpeta assets
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Superposición para mejorar la legibilidad */}
          <View style={styles.overlay} />
          <View style={styles.content}>
            <Text style={styles.title}>Programar Mensaje de Video</Text>

            {/* Seleccionar Beneficiario */}
            <Text style={styles.label}>Selecciona un beneficiario:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedBeneficiary}
                onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                style={styles.picker}
                dropdownIconColor="#FFD700"
              >
                <Picker.Item label="Selecciona un beneficiario" value="" />
                {beneficiarios.map(beneficiary => (
                  <Picker.Item
                    key={beneficiary.id}
                    label={beneficiary.name}
                    value={beneficiary.id}
                  />
                ))}
              </Picker>
            </View>

            {/* Seleccionar o Grabar Video */}
            <Text style={styles.label}>Selecciona o graba un video:</Text>
            <View style={styles.videoButtonsContainer}>
              <TouchableOpacity style={styles.videoButton} onPress={seleccionarVideo}>
                <MaterialIcons name="video-library" size={30} color="#FFD700" />
                <Text style={styles.videoButtonText}>Subir Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.videoButton} onPress={grabarVideo}>
                <MaterialIcons name="videocam" size={30} color="#FFD700" />
                <Text style={styles.videoButtonText}>Grabar Video</Text>
              </TouchableOpacity>
            </View>

            {/* Vista Previa de Video */}
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
                  <MaterialIcons name="delete" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}

            {/* Seleccionar Fecha y Hora */}
            <Text style={styles.label}>Fecha y hora de envío:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showDatePickerModal}
            >
              <Text style={styles.dateButtonText}>
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            />

            {/* Botones de Guardar y Cancelar */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveMessage}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButtonMain} onPress={() => navigation.goBack()}>
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
    backgroundColor: '#1E1E1E', // Fondo oscuro para contraste
  },
  container: {
    flexGrow: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFD700',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#FFD700", // Fondo dorado
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonMain: {
    backgroundColor: "#E74C3C", // Fondo rojo para contraste
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1E1E1E',
    fontWeight: 'bold',
    fontSize: 16,
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
  label: {
    fontSize: 16,
    color: "#FFD700", // Color dorado
    marginBottom: 10,
    alignSelf: 'flex-start',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD700", // Bordes dorados
    borderRadius: 8,
    width: "100%",
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo semi-transparente oscuro
  },
  picker: {
    height: 40,
    color: "#FFD700", // Texto dorado
  },
  pickerItem: {
    color: '#FFD700', // Color dorado en items
  },
  videoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  videoButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.8)', // Fondo dorado semi-transparente
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  videoButtonText: {
    color: "#1E1E1E", // Texto oscuro para contraste
    fontWeight: "bold",
    marginTop: 5,
  },
  mediaContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    position: 'relative',
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 15,
    padding: 5,
  },
  dateButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 215, 0, 0.8)", // Fondo dorado semi-transparente
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#1E1E1E", // Texto oscuro para contraste
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
});

export default ProgramarMensaje;
