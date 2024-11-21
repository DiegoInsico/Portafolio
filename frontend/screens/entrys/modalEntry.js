// ModalEntry.js

import React, { useState, useEffect } from "react";
import {
  Switch,
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
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import ColorPicker from "../../components/ui/ColorPicker";
import { Audio } from "expo-av";
import AudioRecorder from "../../components/general/audioComponent";
import { MaterialIcons, Entypo, Feather } from "@expo/vector-icons";
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
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Video } from "expo-av";

const ModalEntry = ({ visible, onClose }) => {
  const [selectedType, setSelectedType] = useState("Galería");
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [cancion, setCancion] = useState(null);
  const [nivel, setNivel] = useState("1");
  const [enableRecuerdoDate, setEnableRecuerdoDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#fff");
  const [baul, setBaul] = useState(false);
  const today = new Date();

  // Nuevo estado para controlar Texto o Audio
  const [selectedSubType, setSelectedSubType] = useState("Texto");

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

  const eliminarAudio = () => {
    setAudioUri(null);
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
          setCancion(null);
        } else if (type === "video") {
          setMediaType("video");
          setMedia(selectedMedia);
          setCancion(null);
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

  // Función para buscar canciones en Spotify usando Axios
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
      setSpotifyResults(response.data); // Guardar los resultados de Spotify
    } catch (error) {
      console.error("Error al buscar canciones en Spotify:", error);
    }
  };

  const handleGuardar = async () => {
    // Obtener la instancia de autenticación
    const auth = getAuth();
    const user = auth.currentUser; // Obtener el usuario autenticado

    // Comprobamos el límite de entradas por nivel
    const userEntriesQuery = query(
      collection(db, "entradas"),
      where("userId", "==", user.uid),
      where("nivel", "==", nivel)
    );
    const userEntries = await getDocs(userEntriesQuery);

    const limites = { "1": 50, "2": 10, "3": 4 };
    if (userEntries.size >= limites[nivel]) {
      Alert.alert(
        "Límite alcanzado",
        "Has alcanzado el límite de entradas para este nivel."
      );
      return;
    }

    // Verificar si el usuario está autenticado
    if (!user) {
      Alert.alert(
        "Error",
        "No hay un usuario autenticado. Por favor, inicia sesión."
      );
      return;
    }

    // Validaciones iniciales
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

      // Subir media (imagen o video) si existe
      if (media) {
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

      // Subir audio si existe
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

      // Si hay una canción de Spotify seleccionada
      if (cancion) {
        cancionData = {
          id: cancion.id,
          name: cancion.name,
          artist: cancion.artist,
          albumImage: cancion.albumImage,
        };
      }

      // Análisis de emociones utilizando IA
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
        userId: user.uid, // Añadir el ID del usuario autenticado
        categoria,
        texto: texto || null,
        audio: audioURL || null,
        cancion: cancionData || null,
        media: mediaURL || null,
        mediaType: mediaType || null,
        color: selectedColor,
        baul,
        fechaCreacion: serverTimestamp(),
        fechaRecuerdo: enableRecuerdoDate ? selectedDate : null,
        emociones, // Aquí guardamos las emociones detectadas
        nivel, // Nivel de profundidad
        isProtected: nivel === "2" || nivel === "3", // Seguridad adicional para niveles 2 y 3
      };

      const docRef = await addDoc(collection(db, "entradas"), nuevaEntrada);
      await updateDoc(docRef, { id: docRef.id });

      console.log("Documento escrito con ID: ", docRef.id);
      resetForm();
      Alert.alert("Éxito", "La entrada se ha guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar la entrada: ", error);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la entrada. Por favor, intenta de nuevo."
      );
    }
  };

  const resetForm = () => {
    setSelectedType("Galería");
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
    setSelectedSubType("Texto"); // Resetear a "Texto" por defecto
  };

  const onChangeDate = (event, selectedDateValue) => {
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
      <SafeAreaView style={styles.safeArea}>
        {/* Configurar el StatusBar */}
        <StatusBar
          barStyle="dark-content"
          translucent={false}
          backgroundColor="#f0f0f0"
        />

        <View style={styles.background}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Título del Modal */}
              <Text style={styles.titulo}>Crear Nuevo Instante</Text>

              {/* Selector de Tipo usando SegmentedControl */}
              <SegmentedControl
                values={["Galería", "Spotify", "Texto", "Audio"]}
                selectedIndex={["Galería", "Spotify", "Texto", "Audio"].indexOf(
                  selectedType
                )}
                onChange={(event) => {
                  const index = event.nativeEvent.selectedSegmentIndex;
                  const type = ["Galería", "Spotify", "Texto", "Audio"][index];
                  setSelectedType(type);
                  // Resetear campos relacionados al tipo
                  setMedia(null);
                  setMediaType(null);
                  setCancion(null);
                  setAudioUri(null);
                  setTexto("");
                  setSpotifyResults([]);
                  setSelectedSubType("Texto"); // Resetear a "Texto" por defecto
                }}
                tintColor="#4CAF50"
                style={styles.segmentedControl}
                fontStyle={{ color: "#333" }}
                activeFontStyle={{ color: "#fff", fontWeight: "700" }}
              />

              {/* Renderizar contenido basado en el tipo seleccionado */}
              {(selectedType === "Galería" || selectedType === "Spotify") && (
                <>
                  {selectedType === "Galería" && (
                    <>
                      {/* Selector de Medios */}
                      {media && mediaType === "image" && (
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
                      {media && mediaType === "video" && (
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
                      {!media && (
                        <Pressable
                          style={styles.iconoGaleria}
                          onPress={seleccionarMedia}
                        >
                          <Entypo name="image" size={50} color="#4CAF50" />
                          <Text style={styles.iconoGaleriaTexto}>
                            Seleccionar Media
                          </Text>
                        </Pressable>
                      )}
                    </>
                  )}

                  {selectedType === "Spotify" && (
                    <>
                      {/* Campo de búsqueda para Spotify */}
                      {!cancion && (
                        <View style={styles.spotifyContainer}>
                          <TextInput
                            style={styles.input}
                            placeholder="Buscar canción en Spotify"
                            placeholderTextColor="#ccc"
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

                          {/* Mostrar resultados de Spotify */}
                          {searchQuery.length > 2 &&
                            spotifyResults.length > 0 && (
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
                                          albumImage:
                                            track.album.images[0].url,
                                        });
                                        setSearchQuery("");
                                        setSpotifyResults([]);
                                      }}
                                    >
                                      <View style={styles.trackContainer}>
                                        <Image
                                          source={{
                                            uri: track.album.images[0].url,
                                          }}
                                          style={styles.trackImage}
                                        />
                                        <View style={styles.trackInfo}>
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
                      )}

                      {/* Vista Previa de Canción de Spotify */}
                      {cancion && (
                        <View style={styles.mediaContainer}>
                          <Image
                            source={{ uri: cancion.albumImage }}
                            style={styles.trackImageSelect}
                          />
                          <Text style={styles.trackNameSelect}>
                            {cancion.name}
                          </Text>
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
                    </>
                  )}

                  {/* Selector para elegir entre Texto o Audio */}
                  <SegmentedControl
                    values={["Texto", "Audio"]}
                    selectedIndex={["Texto", "Audio"].indexOf(selectedSubType)}
                    onChange={(event) => {
                      const index = event.nativeEvent.selectedSegmentIndex;
                      const type = ["Texto", "Audio"][index];
                      setSelectedSubType(type);
                      if (type === "Texto") {
                        setAudioUri(null);
                      } else {
                        setTexto("");
                      }
                    }}
                    tintColor="#4CAF50"
                    style={styles.subSegmentedControl}
                    fontStyle={{ color: "#333" }}
                    activeFontStyle={{ color: "#fff", fontWeight: "700" }}
                  />

                  {/* Campo de Texto o Audio */}
                  {selectedSubType === "Texto" ? (
                    <View style={styles.textoContainer}>
                      <TextInput
                        style={styles.inputTexto}
                        multiline
                        numberOfLines={4}
                        placeholder="Añade un comentario"
                        placeholderTextColor="#999"
                        value={texto}
                        onChangeText={setTexto}
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
                          <Pressable onPress={eliminarAudio}>
                            <MaterialIcons name="close" size={20} color="red" />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )}
                </>
              )}

              {selectedType === "Texto" && (
                <View style={styles.switchContentContainer}>
                  <View style={styles.textoContainer}>
                    <TextInput
                      style={styles.inputTexto}
                      multiline
                      numberOfLines={4}
                      placeholder="Cuéntame algo"
                      placeholderTextColor="#999"
                      value={texto}
                      onChangeText={setTexto}
                    />
                  </View>
                </View>
              )}

              {selectedType === "Audio" && (
                <View style={styles.audioModeContainer}>
                  <AudioRecorder onRecordingComplete={manejarGrabacionCompleta} />
                  {audioUri && (
                    <View style={styles.audioPreview}>
                      <Text style={styles.audioText}>Audio Grabado</Text>
                      <Pressable onPress={eliminarAudio}>
                        <MaterialIcons name="close" size={20} color="red" />
                      </Pressable>
                    </View>
                  )}
                </View>
              )}

              {/* Selector de Color */}
              <View style={styles.pickerContent}>
                <ColorPicker
                  style={styles.recuadroPicker}
                  selectedColor={selectedColor}
                  onColorSelect={(color) => setSelectedColor(color)}
                />
              </View>

              {/* Nivel de profundidad */}
              <Text style={styles.label}>Nivel de profundidad</Text>
              <RNPickerSelect
                onValueChange={(value) => setNivel(value)}
                items={[
                  { label: "Nivel 1 - General", value: "1" },
                  { label: "Nivel 2 - Privado", value: "2" },
                  { label: "Nivel 3 - Profundo", value: "3" },
                ]}
                placeholder={{
                  label: "Selecciona el nivel de privacidad",
                  value: null,
                }}
                style={pickerSelectStyles}
                value={nivel}
              />

              {/* Categoría */}
              <Text style={styles.label}>Categoría</Text>
              <RNPickerSelect
                onValueChange={(value) => setCategoria(value)}
                items={[
                  { label: "😊 Alegría", value: "Alegría" },
                  { label: "🙏 Gratitud", value: "Gratitud" },
                  { label: "❤️ Amor", value: "Amor" },
                  { label: "💔 Pérdida", value: "Pérdida" },
                  { label: "🤔 Reflexión", value: "Reflexión" },
                  { label: "💪 Desafío", value: "Desafío" },
                ]}
                placeholder={{
                  label: "Selecciona una categoría",
                  value: "",
                  color: "#9EA0A4",
                }}
                style={pickerSelectStyles}
                value={categoria}
              />

              {/* Fecha del Recuerdo */}
              <View style={styles.fechaRecuerdoContainer}>
                <View style={styles.fechaRecuerdoHeader}>
                  <Feather name="calendar" size={20} color="#FFD700" />
                  <Text style={styles.fechaRecuerdoLabel}>Fecha de Recuerdo</Text>
                  <Switch
                    value={enableRecuerdoDate}
                    onValueChange={(value) => {
                      setEnableRecuerdoDate(value);
                      if (!value) {
                        setSelectedDate(new Date());
                      }
                    }}
                    trackColor={{ false: "#767577", true: "#FFD700" }}
                    thumbColor={enableRecuerdoDate ? "#FFD700" : "#f4f3f4"}
                  />
                </View>

                {enableRecuerdoDate && selectedDate && (
                  <View style={styles.recuerdoDateDisplay}>
                    <Text style={styles.recuerdoDateText}>
                      {selectedDate.toLocaleDateString("es-ES")}
                    </Text>
                    <Pressable onPress={() => setShowDatePicker(true)}>
                      <Feather name="edit" size={18} color="#FFD700" />
                    </Pressable>
                  </View>
                )}

                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeDate}
                    maximumDate={today}
                    style={styles.dateTimePicker}
                  />
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
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Estilos principales
const styles = StyleSheet.create({
  /* ====== Safe Area Styles ====== */
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo semi-transparente
  },

  /* ====== Background Styles ====== */
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente
    justifyContent: "center",
    alignItems: "center",
  },

  /* ====== Container Styles ====== */
  modalContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 1,
  },
  modalContent: {
    width: "90%", // Ajuste para ocupar el 90% de la pantalla
    height: "97%", // Ajuste para ocupar el 97% de la pantalla en altura
    backgroundColor: "#f0f0f0", // Fondo sólido y moderno
    borderRadius: 20, // Bordes más redondeados para un aspecto más suave
    padding: 30,
    elevation: 10, // Sombra más sutil y moderna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },

  /* ====== Text Styles ====== */
  titulo: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 5, // Aumentado para más espacio
    textAlign: "center",
    color: "#333",
  },
  label: {
    marginTop: 1, // Aumentado para más espacio
    marginBottom: 5, // Aumentado para más espacio
    fontWeight: "600",
    color: "#333",
    fontSize: 16,
  },

  /* ====== Input Styles ====== */
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10, // Aumentado para más espacio interno
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
    color: "#333",
    width: "100%",
    marginBottom: 10, // Aumentado para más espacio entre elementos
    fontSize: 16,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 10, // Aumentado para más espacio interno
    textAlignVertical: "top",
    backgroundColor: "#f1f1f1",
    height: 100, // Aumentado para mayor área de texto
    width: "100%",
    marginBottom: 10, // Aumentado para más espacio entre elementos
    color: "#333",
    fontSize: 16,
  },

  /* ====== Segmented Control Styles ====== */
  segmentedControl: {
    marginBottom: 25, // Aumentado para más espacio
    width: "100%",
    height: 45, // Aumentado para mejor visibilidad
    borderRadius: 30, // Mantener bordes redondeados
  },
  subSegmentedControl: {
    marginBottom: 15, // Espacio entre el segmented control y el contenido
    width: "100%",
    height: 40,
    borderRadius: 20,
  },

  /* ====== Switch Content Container ====== */
  switchContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15, // Aumentado para más espacio
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
    paddingBottom: 20,
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15, // Aumentado para más espacio
  },
  audioText: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },

  /* ====== Botón Styles ====== */
  botonContainer: {
    flexDirection: "row",
    marginTop: 5, // Aumentado para más espacio
    width: "100%",
  },
  botonGuardar: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16, // Aumentado para mayor altura
    borderRadius: 12,
    flex: 1,
    marginRight: 12, // Aumentado para más espacio entre botones
    alignItems: "center",
    justifyContent: "center",
  },
  botonCancelar: {
    backgroundColor: "#f44336",
    paddingVertical: 16, // Aumentado para mayor altura
    borderRadius: 12,
    flex: 1,
    marginLeft: 12, // Aumentado para más espacio entre botones
    alignItems: "center",
    justifyContent: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  /* ====== Media Styles ====== */
  mediaContainer: {
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginTop: 5,
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  trackImageSelect: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
  },
  eliminarIcono: {
    position: "absolute",
    top: 15, // Aumentado para mejor posición
    right: 15, // Aumentado para mejor posición
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 6, // Aumentado para mejor toque
    borderRadius: 20,
  },

  /* ====== Galería y Spotify Styles ====== */
  iconoGaleria: {
    alignSelf: "center",
    marginVertical: 20, // Aumentado para más espacio
    alignItems: "center",
  },
  iconoGaleriaTexto: {
    marginTop: 15, // Aumentado para más espacio
    fontSize: 16,
    color: "#4CAF50",
  },
  spotifyContainer: {
    width: "100%",
    marginVertical: 15, // Aumentado para más espacio
    position: "relative",
  },
  spotifyResultsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 5,
    maxHeight: 250,
    zIndex: 10,
  },
  spotifyResults: {
    paddingHorizontal: 20, // Aumentado para más espacio interno
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 12, // Aumentado para más espacio interno
    borderRadius: 10,
    marginBottom: 12, // Aumentado para más espacio entre tracks
  },
  trackImage: {
    width: 60, // Aumentado para mejor visibilidad
    height: 60, // Aumentado para mejor visibilidad
    marginRight: 20, // Aumentado para más espacio entre imagen y texto
    borderRadius: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontWeight: "700",
    fontSize: 16,
    color: "#333",
  },
  trackArtist: {
    color: "#666",
    fontSize: 14,
    marginTop: 6, // Aumentado para mejor separación
  },
  trackNameSelect: {
    fontWeight: "700",
    fontSize: 18,
    color: "#333",
    marginTop: 10,
    textAlign: "center",
  },
  trackArtistSelect: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
  },

  /* ====== Color Picker Styles ====== */
  pickerContent: {
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20, // Aumentado para más espacio
    width: "100%",
  },
  recuadroPicker: {
    width: "100%", // Ajustado para que no se extienda fuera del modal
    marginBottom: 10, // Aumentado para más espacio
  },

  /* ====== Fecha de Recuerdo Styles ====== */
  fechaRecuerdoContainer: {
    marginBottom: 10, // Aumentado para más espacio
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 20, // Aumentado para más espacio
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fechaRecuerdoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fechaRecuerdoLabel: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  recuerdoDateDisplay: {
    marginTop: 15, // Aumentado para más espacio
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recuerdoDateText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
  dateTimePicker: {
    width: "100%",
    backgroundColor: "#fff",
  },

  /* ====== Additional Styles ====== */
  switchItem: {
    marginBottom: 10,
  },
  datePickerPressable: {
    marginBottom: 10,
  },
});

// Estilos para react-native-picker-select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 15,
  },
});

export default ModalEntry;
