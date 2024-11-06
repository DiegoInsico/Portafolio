// ProgramarMensaje.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from "expo-image-picker";
import { db } from '../../utils/firebase'; // Asegúrate de que la ruta sea correcta
import { collection, addDoc, getDocs, Timestamp  } from 'firebase/firestore';
import CustomSwitch from "../../components/ui/SwitchButton"; // Asegúrate de que la ruta sea correcta
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import PropTypes from 'prop-types';
import { Audio, Video } from 'expo-av'; // Importa Video junto con Audio

const ProgramarMensaje = ({ navigation }) => { // Recibe navigation como prop
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isSpotifyMode, setIsSpotifyMode] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  
  // Estados para grabación de audio
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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

  // Funciones para grabar audio
  const startRecording = async () => {
    try {
      console.log('Solicitando permisos de audio...');
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Se necesitan permisos para grabar audio.');
        return;
      }

      console.log('Iniciando grabación...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      console.log('Grabación iniciada');
    } catch (err) {
      console.error('Fallo al iniciar la grabación', err);
      Alert.alert('Error', 'No se pudo iniciar la grabación.');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Deteniendo grabación...');
      setRecording(undefined);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI(); 
      setAudioUri(uri);
      console.log('Grabación detenida y almacenada en', uri);
    } catch (error) {
      console.error('Error al detener la grabación', error);
      Alert.alert('Error', 'No se pudo detener la grabación.');
    }
  };

  const handleSaveMessage = async () => {
    if (!selectedBeneficiary || (!messageText && !media && !audioUri)) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    // Encontrar el beneficiario seleccionado para obtener su email
    const selectedBeneficiaryData = beneficiarios.find(b => b.id === selectedBeneficiary);
    const email = selectedBeneficiaryData?.email;

    if (!email) {
      Alert.alert('Error', 'El beneficiario seleccionado no tiene un correo electrónico asociado.');
      return;
    }

    try {
      await addDoc(collection(db, 'mensajesProgramados'), {
        beneficiarioId: selectedBeneficiary,
        email: email, // Añadir el campo email
        mensaje: messageText,
        fechaEnvio: Timestamp.fromDate(date), // Convertir 'date' a Timestamp
        media: media || audioUri,
        mediaType: mediaType || (audioUri ? 'audio' : null),
        enviado: false, // Inicialmente, el mensaje no está enviado
      });
      Alert.alert('Éxito', 'Mensaje programado correctamente.');
      resetStates();
      navigation.goBack(); // Navega de vuelta a la pantalla anterior
    } catch (error) {
      console.error('Error al programar el mensaje:', error);
      Alert.alert('Error', 'No se pudo programar el mensaje.');
    }
  };

  const resetStates = () => {
    setSelectedBeneficiary('');
    setDate(new Date());
    setMessageText('');
    setIsAudioMode(false);
    setIsSpotifyMode(false);
    setMedia(null);
    setMediaType(null);
    setAudioUri(null);
    setRecording(null);
    setIsRecording(false);
    setSearchQuery('');
    setSpotifyResults([]);
  };

  const seleccionarMedia = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setMedia(selectedAsset.uri);
        setMediaType(selectedAsset.type); // 'image' o 'video'
        setMessageText('');
      }
    } catch (error) {
      console.log("Error al seleccionar media:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el medio.");
    }
  };

  const eliminarMedia = () => {
    setMedia(null);
    setMediaType(null);
    setAudioUri(null);
    setIsRecording(false);
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const buscarCancionesSpotify = async (query) => {
    try {
      const response = await axios.get(`http://192.168.1.12:3000/spotify/search`, {
        params: { query },
      });
      setSpotifyResults(response.data);
    } catch (error) {
      console.error("Error al buscar canciones en Spotify:", error);
      Alert.alert("Error", "No se pudo buscar canciones en Spotify.");
    }
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
            <Text style={styles.title}>Programar Mensaje</Text>

            {/* Seleccionar Beneficiario */}
            <Text style={styles.label}>Selecciona un beneficiario:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedBeneficiary}
                onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // Para Android
                dropdownIconColor="#FFD700" // Icono del Picker en dorado
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

            {/* Escribir el Mensaje */}
            <Text style={styles.label}>Escribe tu mensaje:</Text>
            <TextInput
              style={styles.messageInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="Escribe tu mensaje aquí"
              placeholderTextColor="#888"
              multiline
            />

            {/* Switch entre Texto y Audio */}
            <CustomSwitch
              style={styles.switchItem}
              option1="Texto"
              option2="Audio"
              color1="#FFD700" // Color dorado para opción 1
              color2="#FFD700" // Color dorado para opción 2
              value={isAudioMode}
              onSwitch={(value) => {
                setIsAudioMode(value);
                setMessageText('');
                eliminarMedia(); // Limpia media y audio al cambiar
              }}
            />

            {/* Selector de Media */}
            {!isAudioMode && !isSpotifyMode && (
              <TouchableOpacity style={styles.iconButton} onPress={seleccionarMedia}>
                <MaterialIcons name="add-photo-alternate" size={40} color="#FFD700" />
                <Text style={styles.iconButtonText}>Añadir Imagen / Video</Text>
              </TouchableOpacity>
            )}

            {/* Vista Previa de Media */}
            {media && (
              <View style={styles.mediaContainer}>
                {mediaType === "image" ? (
                  <Image source={{ uri: media }} style={styles.mediaPreview} />
                ) : mediaType === "video" ? (
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
                ) : null}
                <TouchableOpacity style={styles.deleteButton} onPress={eliminarMedia}>
                  <MaterialIcons name="delete" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}

            {/* Vista Previa de Audio */}
            {isAudioMode && (
              <View style={styles.audioContainer}>
                <TouchableOpacity 
                  style={styles.audioButton}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <MaterialIcons 
                    name={isRecording ? "stop" : "mic"} 
                    size={40} 
                    color="#FFD700" 
                  />
                  <Text style={styles.audioButtonText}>
                    {isRecording ? "Detener" : "Grabar"}
                  </Text>
                </TouchableOpacity>
                {audioUri && (
                  <View style={styles.audioPreview}>
                    <Text style={styles.audioText}>Audio grabado:</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        Audio.Sound.createAsync({ uri: audioUri })
                          .then(({ sound }) => {
                            sound.playAsync();
                          })
                          .catch(error => {
                            console.error("Error al reproducir el audio:", error);
                            Alert.alert("Error", "No se pudo reproducir el audio.");
                          });
                      }}
                    >
                      <Text style={styles.audioPlayText}>Reproducir Audio</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Switch entre Galería/Video y Spotify */}
            <CustomSwitch
              style={styles.switchItem}
              option1="Galería"
              option2="Spotify"
              color1="#FFD700" // Color dorado para opción 1
              color2="#FFD700" // Color dorado para opción 2
              value={isSpotifyMode}
              onSwitch={(value) => {
                setIsSpotifyMode(value);
                if (value) {
                  eliminarMedia(); // Limpia cualquier media seleccionada
                  setMessageText(''); // Limpia mensaje de texto si es necesario
                }
              }}
            />

            {/* Campo de búsqueda para Spotify */}
            {isSpotifyMode && (
              <TextInput
                style={styles.input}
                placeholder="Buscar canción en Spotify"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length > 2) {
                    buscarCancionesSpotify(text);
                  } else {
                    setSpotifyResults([]);
                  }
                }}
              />
            )}

            {/* Mostrar resultados de Spotify */}
            {isSpotifyMode && spotifyResults.length > 0 && (
              <View style={styles.spotifyResultsContainer}>
                <ScrollView style={styles.spotifyResults}>
                  {spotifyResults.map((track) => (
                    <TouchableOpacity
                      key={track.id}
                      style={styles.spotifyItem}
                      onPress={() => {
                        setMessageText(`🎵 ${track.name} - ${track.artist}`);
                        setSpotifyResults([]);
                        setIsSpotifyMode(false); // Opcional: cerrar Spotify mode
                      }}
                    >
                      <Text style={styles.spotifyText}>{track.name} - {track.artist}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
  navigation: PropTypes.object.isRequired, // Asegura que navigation es un objeto
};

// Definición de estilos
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
  messageInput: {
    borderWidth: 1,
    borderColor: "#FFD700", // Bordes dorados
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.1)", // Fondo semi-transparente oscuro
    color: "#FFD700",
    width: "100%",
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchItem: {
    marginBottom: 20,
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    marginVertical: 15,
  },
  iconButtonText: {
    color: "#FFD700", // Texto dorado
    fontSize: 14,
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
    resizeMode: "cover",
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 15,
    padding: 5,
  },
  audioContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)', // Fondo semi-transparente oscuro
  },
  audioButton: {
    alignItems: "center",
    marginVertical: 10,
  },
  audioButtonText: {
    color: "#FFD700", // Texto dorado
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  audioPreview: {
    marginTop: 10,
    alignItems: 'center',
  },
  audioText: {
    color: "#FFD700",
    marginBottom: 5,
  },
  audioPlayText: {
    color: "#FFD700",
    textDecorationLine: 'underline',
  },
  spotifyResultsContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.1)", // Fondo semi-transparente oscuro
    borderRadius: 8,
    maxHeight: 200,
    marginTop: 10,
    elevation: 5,
  },
  spotifyResults: {
    paddingHorizontal: 10,
  },
  spotifyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FFD700", // Bordes dorados
  },
  spotifyText: {
    color: "#FFD700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700", // Bordes dorados
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.1)", // Fondo semi-transparente oscuro
    color: "#FFD700",
    width: "100%",
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
  saveButton: {
    backgroundColor: "#FFD700", // Fondo dorado
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#E74C3C", // Fondo rojo para contraste
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "#1E1E1E", // Texto oscuro para contraste
    textAlign: "center",
    fontWeight: "600",
  },
});

export default ProgramarMensaje;
