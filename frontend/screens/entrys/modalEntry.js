// ModalEntry.js

import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Alert,
  Switch,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import ColorPicker from "../../components/ui/ColorPicker";
import { Audio } from "expo-av";
import { Video } from "expo-av";
import CustomSwitch from "../../components/ui/SwitchButton";
import AudioRecorder from "../../components/general/audioComponent";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import axios from "axios";
import { getAuth } from "firebase/auth";
import { db, storage } from "../../utils/firebase";
import {
  addDoc,
  updateDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import uuid from "react-native-uuid";

const ModalEntry = ({ visible, onClose }) => {
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [isSpotifyMode, setIsSpotifyMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [baul, setBaul] = useState(false);
  const [cancion, setCancion] = useState(null);
  const [nivel, setNivel] = useState("Básico");
  const [enableRecuerdoDate, setEnableRecuerdoDate] = useState(false);
  const today = new Date();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: mediaStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== "granted") {
          Alert.alert(
            "Permiso requerido",
            "Se necesitan permisos para acceder a la galería."
          );
        }

        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        if (audioStatus !== "granted") {
          Alert.alert(
            "Permiso requerido",
            "Se necesitan permisos para acceder al micrófono."
          );
        }
      }
    })();

    return () => {
      if (sound) {
        sound
          .unloadAsync()
          .catch((error) => console.log("Error descargando el sonido:", error));
      }
    };
  }, [sound]);

  const manejarGrabacionCompleta = (audio) => {
    setAudioUri(audio.uri);
  };

  const seleccionarMedia = async () => {
    try {
      let resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!resultado.cancelled) {
        let type;
        let selectedMedia;

        if (resultado.assets && resultado.assets.length > 0) {
          type = resultado.assets[0].type;
          selectedMedia = resultado.assets[0];
        } else {
          type = resultado.type;
          selectedMedia = resultado;
        }

        if (type === "image") {
          setMediaType("image");
          setMedia(selectedMedia);
          setIsSpotifyMode(false);
          setCancion(null);
          setAudioUri(null);
          setTexto("");
        } else if (type === "video") {
          setMediaType("video");
          setMedia(selectedMedia);
          setIsSpotifyMode(false);
          setCancion(null);
          setAudioUri(null);
          setTexto("");
        } else {
          Alert.alert(
            "Tipo de medio no soportado",
            "Por favor, selecciona una imagen o un video."
          );
        }
      }
    } catch (error) {
      console.log("Error al seleccionar media:", error);
      Alert.alert("Error", "Hubo un problema al seleccionar el medio.");
    }
  };

  const eliminarMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  const eliminarCancion = () => {
    setCancion(null);
  };

  const buscarCancionesSpotify = async (query) => {
    try {
      const response = await axios.get(
        `http://192.168.1.12:3000/spotify/search`,
        {
          params: {
            query: query,
          },
        }
      );
      setSpotifyResults(response.data);
    } catch (error) {
      console.error("Error al buscar canciones en Spotify:", error);
    }
  };

  const handleGuardar = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    const userEntriesQuery = query(
      collection(db, "entradas"),
      where("userId", "==", user.uid),
      where("nivel", "==", nivel)
    );
    const userEntries = await getDocs(userEntriesQuery);

    const limites = { Básico: 50, Privado: 10, Profundo: 4 };
    if (userEntries.size >= limites[nivel]) {
      Alert.alert(
        "Límite alcanzado",
        `Has alcanzado el límite de entradas para el nivel ${nivel}.`
      );
      return;
    }

    if (!user) {
      Alert.alert(
        "Error",
        "No hay un usuario autenticado. Por favor, inicia sesión."
      );
      return;
    }

    if (!categoria) {
      Alert.alert("Error", "Por favor, selecciona una categoría.");
      return;
    }

    if (!texto && !media && !audioUri && !cancion) {
      Alert.alert(
        "Error",
        "Por favor, agrega al menos un contenido a la entrada."
      );
      return;
    }

    if (enableRecuerdoDate) {
      if (!selectedDate) {
        Alert.alert(
          "Error",
          "Por favor, selecciona una fecha para el recuerdo."
        );
        return;
      }
    }

    try {
      let mediaURL = null;
      let audioURL = null;
      let cancionData = null;
      let emociones = [];

      if (media && media.type !== "spotify") {
        const mediaRef = ref(
          storage,
          `media/${uuid.v4()}_${media.uri.substring(
            media.uri.lastIndexOf("/") + 1
          )}`
        );
        const response = await fetch(media.uri);
        const blob = await response.blob();
        await uploadBytes(mediaRef, blob);
        mediaURL = await getDownloadURL(mediaRef);
      }

      if (audioUri) {
        const audioRef = ref(
          storage,
          `audios/${uuid.v4()}_${audioUri.substring(
            audioUri.lastIndexOf("/") + 1
          )}`
        );
        const response = await fetch(audioUri);
        const blob = await response.blob();
        await uploadBytes(audioRef, blob);
        audioURL = await getDownloadURL(audioRef);
      }

      if (cancion) {
        cancionData = {
          id: cancion.id,
          name: cancion.name,
          artist: cancion.artist,
          albumImage: cancion.albumImage,
        };
      }

      if (texto) {
        const response = await axios.get(
          "http://192.168.1.12:3000/api/emotion",
          {
            params: { text: texto },
          }
        );
        emociones = response.data.emotions;
      }

      const nuevaEntrada = {
        userId: user.uid,
        categoria,
        texto: null,
        audio: null,
        cancion: null,
        media: null,
        mediaType: null,
        color: selectedColor,
        baul,
        fechaCreacion: serverTimestamp(),
        fechaRecuerdo: enableRecuerdoDate ? selectedDate : null,
        emociones,
        nivel,
        isProtected: nivel === "Privado" || nivel === "Profundo",
      };

      if (cancionData) {
        nuevaEntrada.cancion = cancionData;
      } else if (mediaURL) {
        nuevaEntrada.media = mediaURL;
        nuevaEntrada.mediaType = mediaType;
      }

      if (audioURL) {
        nuevaEntrada.audio = audioURL;
      } else if (texto) {
        nuevaEntrada.texto = texto;
      }

      const docRef = await addDoc(collection(db, "entradas"), nuevaEntrada);

      await updateDoc(docRef, { id: docRef.id });

      console.log("Documento escrito con ID: ", docRef.id);

      setCategoria("");
      setTexto("");
      setAudioUri(null);
      setSound(null);
      setMedia(null);
      setMediaType(null);
      setCancion(null);
      setSelectedDate(new Date());
      setBaul(false);
      setSelectedColor("#ffffff");
      setEnableRecuerdoDate(false);
      onClose();
    } catch (error) {
      console.error("Error al guardar la entrada: ", error);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la entrada. Por favor, intenta de nuevo."
      );
    }
  };

  const onChangeDateHandler = (event, selectedDateValue) => {
    const currentDate = selectedDateValue || new Date();
    setShowDatePicker(false);
    if (currentDate < today) {
      setSelectedDate(currentDate);
    } else {
      Alert.alert("Error", "La fecha debe ser anterior a hoy.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.titulo}>Crear Nuevo Instante</Text>

          {/* Sección de Categoría y Nivel */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoría</Text>
            <RNPickerSelect
              onValueChange={(value) => {
                setCategoria(value);
              }}
              items={[
                { label: "Viaje", value: "Viaje" },
                { label: "Evento", value: "Evento" },
                // ... (resto de las categorías)
              ]}
              placeholder={{
                label: "Selecciona una categoría",
                value: "",
                color: "#9EA0A4",
              }}
              style={pickerSelectStyles}
              value={categoria}
            />

            <Text style={styles.label}>Nivel de profundidad</Text>
            <RNPickerSelect
              onValueChange={(value) => setNivel(value)}
              items={[
                { label: "Intimo", value: "1" },
                { label: "Personal", value: "2" },
                { label: "Intimo", value: "3" },
              ]}
              placeholder={{
                label: "Selecciona el nivel de privacidad",
                value: null,
              }}
              style={pickerSelectStyles}
            />
          </View>

          {/* Sección de Tipo de Contenido, Contenido y Agregar */}
          <View style={styles.rowSection}>
            {/* Mitad Izquierda: Tipo de Contenido y Contenido */}
            <View style={styles.leftHalf}>
              <Text style={styles.label}>Tipo de Contenido</Text>
              <CustomSwitch
                style={styles.switchItem}
                option1="Galería/Video"
                option2="Spotify"
                color1="#4CAF50"
                color2="#007BFF"
                value={isSpotifyMode}
                onSwitch={(value) => {
                  setIsSpotifyMode(value);
                  if (value) {
                    eliminarMedia();
                    eliminarCancion();
                    setAudioUri(null);
                    setTexto("");
                  } else {
                    setSpotifyResults([]);
                  }
                }}
              />

              <Text style={[styles.label, { marginTop: 10 }]}>Contenido</Text>
              <CustomSwitch
                style={styles.switchItem}
                option1="Texto"
                option2="Audio"
                color1="#007BFF"
                color2="#4CAF50"
                value={isAudioMode}
                onSwitch={(value) => {
                  setIsAudioMode(value);
                  if (value) {
                    setTexto("");
                  } else {
                    setAudioUri(null);
                    setSound(null);
                  }
                }}
              />
            </View>

            {/* Mitad Derecha: Botón Agregar Imagen o Video */}
            <View style={styles.rightHalf}>
              {!isSpotifyMode && (
                <View style={styles.agregarContainer}>
                  {!media ? (
                    <Pressable
                      style={styles.iconoGaleria}
                      onPress={seleccionarMedia}
                    >
                      <Entypo name="image" size={40} color="#007BFF" />
                      <Text style={styles.iconoGaleriaTexto}>Agregar</Text>
                    </Pressable>
                  ) : (
                    <View>
                      {mediaType === "image" && (
                        <View style={styles.mediaContainer}>
                          <Image
                            source={{ uri: media.uri }}
                            style={styles.mediaPreview}
                          />
                          <Pressable
                            style={styles.eliminarIcono}
                            onPress={eliminarMedia}
                          >
                            <MaterialIcons name="close" size={24} color="red" />
                          </Pressable>
                        </View>
                      )}
                      {mediaType === "video" && (
                        <View style={styles.mediaContainer}>
                          <Video
                            source={{ uri: media.uri }}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            shouldPlay={false}
                            isLooping
                            style={styles.mediaPreview}
                            useNativeControls
                          />
                          <Pressable
                            style={styles.eliminarIcono}
                            onPress={eliminarMedia}
                          >
                            <MaterialIcons name="close" size={24} color="red" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Si está en modo Spotify */}
              {isSpotifyMode && (
                <View style={styles.agregarContainer}>
                  {!cancion ? (
                    <View style={styles.spotifyContainer}>
                      <TextInput
                        style={styles.inputSmall}
                        placeholder="Buscar canción"
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

                      {searchQuery.length > 2 && spotifyResults.length > 0 && (
                        <View style={styles.spotifyResultsContainer}>
                          <ScrollView style={styles.spotifyResults}>
                            {spotifyResults.map((track) => (
                              <Pressable
                                key={track.id}
                                onPress={() => {
                                  setCancion({
                                    id: track.id,
                                    name: track.name,
                                    artist: track.artists[0].name,
                                    albumImage: track.album.images[0].url,
                                  });
                                  setSearchQuery("");
                                  setSpotifyResults([]);
                                  setMedia(null);
                                  setMediaType(null);
                                  setAudioUri(null);
                                  setTexto("");
                                }}
                              >
                                <View style={styles.trackContainer}>
                                  <Image
                                    source={{
                                      uri: track.album.images[0].url,
                                    }}
                                    style={styles.trackImage}
                                  />
                                  <View>
                                    <Text style={styles.trackName}>
                                      {track.name}
                                    </Text>
                                    <Text style={styles.trackArtist}>
                                      {track.artists[0].name}
                                    </Text>
                                  </View>
                                </View>
                              </Pressable>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.mediaContainer}>
                      <Image
                        source={{ uri: cancion.albumImage }}
                        style={styles.trackImageSelect}
                      />
                      <Text style={styles.trackNameSelect}>{cancion.name}</Text>
                      <Text style={styles.trackArtistSelect}>
                        {cancion.artist}
                      </Text>
                      <Pressable
                        style={styles.eliminarIcono}
                        onPress={eliminarCancion}
                      >
                        <MaterialIcons name="close" size={24} color="red" />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Sección de Texto o Audio */}
          <View style={styles.section}>
            <View style={styles.switchContentContainer}>
              {!isAudioMode ? (
                <View style={styles.textoContainer}>
                  <TextInput
                    style={styles.inputSmall}
                    multiline
                    numberOfLines={3}
                    placeholder="Cuéntame algo"
                    value={texto}
                    onChangeText={setTexto}
                    scrollEnabled={true}
                  />
                </View>
              ) : (
                <View style={styles.audioModeContainer}>
                  <AudioRecorder
                    onRecordingComplete={manejarGrabacionCompleta}
                  />
                  {audioUri && (
                    <View style={styles.audioPreview}>
                      <Text style={styles.audioText}>Audio Grabado</Text>
                      <Pressable onPress={() => setAudioUri(null)}>
                        <MaterialIcons name="close" size={20} color="red" />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Opciones Adicionales */}
          <View style={styles.section}>
            {/* Selector de Color */}
            <Text style={styles.label}>Selecciona un Color</Text>
            <View style={styles.pickerContent}>
              <ColorPicker
                style={styles.recuadroPicker}
                selectedColor={selectedColor}
                onColorSelect={(color) => setSelectedColor(color)}
              />
            </View>

            {/* Switch para Activar Fecha del Recuerdo */}
            <View style={styles.switchRecuerdoContainer}>
              <Text style={styles.label}>Fecha del Recuerdo</Text>
              <Switch
                value={enableRecuerdoDate}
                onValueChange={setEnableRecuerdoDate}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={enableRecuerdoDate ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>

            {/* Fecha del Recuerdo */}
            {enableRecuerdoDate && (
              <View style={styles.datePickerContainer}>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={styles.datePickerPressable}
                >
                  <Text style={styles.datePickerText}>
                    {selectedDate
                      ? selectedDate.toLocaleDateString("es-ES")
                      : "Selecciona una fecha"}
                  </Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDateHandler}
                    maximumDate={today}
                  />
                )}
              </View>
            )}
          </View>

          {/* Botones de Acción */}
          <View style={styles.botonContainer}>
            <Pressable style={styles.botonGuardar} onPress={handleGuardar}>
              <Text style={styles.botonTexto}>Guardar</Text>
            </Pressable>
            <Pressable style={styles.botonCancelar} onPress={onClose}>
              <Text style={styles.botonTexto}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  /* Estilos generales */
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 10,
  },
  modalContent: {
    width: "95%",
    backgroundColor: "#4B4E6D",
    borderRadius: 15,
    padding: 15,
    elevation: 5,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FFD700",
  },
  label: {
    marginTop: 5,
    marginBottom: 3,
    fontWeight: "600",
    color: "#FFD700",
    fontSize: 14,
  },
  section: {
    marginBottom: 10,
  },
  /* Estilos de la sección horizontal */
  rowSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftHalf: {
    width: "48%",
  },
  rightHalf: {
    width: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  agregarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconoGaleria: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
  },
  iconoGaleriaTexto: {
    color: "#FFD700",
    marginTop: 3,
    fontSize: 14,
  },
  /* Estilos de media */
  mediaContainer: {
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginTop: 5,
    height: 150,
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  eliminarIcono: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    borderRadius: 12,
  },
  /* Estilos para Spotify */
  spotifyContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 5,
  },
  spotifyResultsContainer: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    maxHeight: 150,
    zIndex: 10,
  },
  spotifyResults: {
    paddingHorizontal: 10,
  },
  trackContainer: {
    flexDirection: "row",
    marginVertical: 3,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 8,
    borderRadius: 8,
  },
  trackImage: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 4,
  },
  trackName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  trackArtist: {
    color: "gray",
    fontSize: 12,
  },
  trackImageSelect: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    resizeMode: "cover",
  },
  trackNameSelect: {
    fontWeight: "bold",
    marginTop: 3,
    fontSize: 14,
    color: "#333",
  },
  trackArtistSelect: {
    color: "gray",
    fontSize: 12,
  },
  /* Estilos de entrada de texto */
  inputSmall: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    height: 80,
    marginTop: 3,
    width: "100%",
    marginBottom: 5,
    fontSize: 14,
  },
  /* Estilos de audio */
  switchContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    width: "100%",
  },
  textoContainer: {
    width: "100%",
    justifyContent: "center",
  },
  audioModeContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  audioText: {
    flex: 1,
    color: "#FFD700",
    fontSize: 14,
  },
  /* Estilos de botones */
  botonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    width: "100%",
  },
  botonGuardar: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    elevation: 3,
  },
  botonCancelar: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    elevation: 3,
  },
  botonTexto: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
  },
  /* Otros estilos */
  switchItem: {
    marginBottom: 5,
  },
  pickerContent: {
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 5,
    width: "60%",
    alignSelf: "center",
  },
  recuadroPicker: {
    marginBottom: 8,
    width: 35,
    height: 35,
  },
  switchRecuerdoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 5,
  },
  datePickerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  datePickerPressable: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
    backgroundColor: "#2C3E50",
    width: "100%",
    alignItems: "center",
  },
  datePickerText: {
    color: "#FFF",
    fontSize: 14,
  },
});

const stylesPickerSelect = StyleSheet.create({
  inputIOS: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 5,
    color: "white",
    paddingRight: 20,
    backgroundColor: "#2C3E50",
    width: "100%",
    marginBottom: 5,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: "#FFD700",
    borderRadius: 5,
    color: "white",
    paddingRight: 20,
    backgroundColor: "#2C3E50",
    width: "100%",
    marginBottom: 5,
  },
});

const pickerSelectStyles = {
  ...stylesPickerSelect,
};

export default ModalEntry;
