// EntryScreen.js

import React, { useState, useEffect } from "react";
import {
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
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RNPickerSelect from "react-native-picker-select";
import { Audio } from "expo-av";
import AudioRecorder from "../../components/general/audioComponent"; // Asegúrate de que este componente esté correctamente implementado
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
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { Video } from "expo-av";
import { categoryColors } from "../../utils/categoryColors"; // Importa categoryColors

// Definir una paleta de colores moderna y armoniosa
const COLORS = {
  primary: "#4A90E2", // Azul vibrante
  secondary: "#50E3C2", // Verde menta
  background: "#F5F7FA", // Gris muy claro
  surface: "#FFFFFF", // Blanco puro
  error: "#E74C3C", // Rojo intenso
  text: "#2C3E50", // Azul oscuro para texto
  placeholder: "#95A5A6", // Gris medio para placeholders
  border: "#DCDCDC", // Gris claro para bordes
  delete: "#E74C3C", // Rojo intenso para eliminar
};

// URL de la imagen de fondo
const BACKGROUND_IMAGE = require("../../assets/background/fondoEntry.webp"); // Asegúrate de tener esta imagen en la ruta indicada

const EntryScreen = ({ navigation, route }) => {
  const { category } = route.params; // Recibir la categoría seleccionada
  const [selectedType, setSelectedType] = useState("Galería");
  const [categoria, setCategoria] = useState(category || "");
  const [texto, setTexto] = useState("");
  const [nickname, setNickname] = useState("");
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
  const [baul, setBaul] = useState(false);
  const today = new Date();
  const [color, setColor] = useState(
    categoryColors[category] || COLORS.surface
  ); // Asignar color basado en la categoría

  // Estado para Galería: Texto o Audio
  const [galeriaSubType, setGaleriaSubType] = useState("Texto");

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
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Permitir imagen y video
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
      Alert.alert("Error", "Ocurrió un error al buscar canciones en Spotify.");
    }
  };

  const handleGuardar = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Error",
        "No hay un usuario autenticado. Por favor, inicia sesión."
      );
      return;
    }

    // Comprobamos el límite de entradas por nivel
    const userEntriesQuery = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
      where("nivel", "==", nivel)
    );
    const userEntriesSnapshot = await getDocs(userEntriesQuery);

    const limites = { 1: 50, 2: 10, 3: 4 };
    if (userEntriesSnapshot.size >= limites[nivel]) {
      Alert.alert(
        "Límite alcanzado",
        "Has alcanzado el límite de entradas para este nivel."
      );
      return;
    }

    // Validaciones iniciales
    if (!categoria) {
      Alert.alert("Error", "Por favor, selecciona una categoría.");
      return;
    }

    if (!nickname.trim()) {
      Alert.alert("Error", "Por favor, asigna un apodo a la entrada.");
      return;
    }

    if (
      (selectedType === "Texto" && !texto) ||
      (selectedType === "Audio" && !audioUri) ||
      (selectedType === "Galería" &&
        !media &&
        (galeriaSubType === "Texto" || galeriaSubType === "Audio") &&
        (!texto && !audioUri)) ||
      (selectedType === "Spotify" && !cancion)
    ) {
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
      if (selectedDate >= today) {
        Alert.alert("Error", "La fecha debe ser anterior a hoy.");
        return;
      }
    }

    try {
      let mediaURL = null;
      let audioURL = null;
      let cancionData = null;
      let emociones = [];

      // Subir media (imagen o video) si existe
      if (selectedType === "Galería" && media) {
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
      if (
        (selectedType === "Galería" &&
          galeriaSubType === "Audio" &&
          audioUri) ||
        (selectedType === "Audio" && audioUri)
      ) {
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
      if (selectedType === "Spotify" && cancion) {
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
        userId: user.uid,
        categoria,
        nickname,
        texto: texto || null,
        audio: audioURL || null,
        cancion: cancionData || null,
        media: mediaURL || null,
        mediaType: mediaType || null,
        color: categoryColors[categoria] || COLORS.surface, // Asignar color basado en la categoría
        baul,
        fechaCreacion: serverTimestamp(),
        fechaRecuerdo: enableRecuerdoDate ? selectedDate : null,
        emociones,
        nivel,
        isProtected: nivel === "2" || nivel === "3",
      };

      const docRef = await addDoc(collection(db, "entradas"), nuevaEntrada);
      await updateDoc(docRef, { id: docRef.id });

      console.log("Documento escrito con ID: ", docRef.id);
      resetForm();
      Alert.alert("Éxito", "La entrada se ha guardado correctamente.");
      navigation.goBack(); // Navegar de vuelta a Home
    } catch (error) {
      console.error("Error al guardar la entrada: ", error);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la entrada. Por favor, intenta de nuevo."
      );
    }
  };

  const resetForm = () => {
    setCategoria(category || "");
    setColor(categoryColors[category] || COLORS.surface);
    setTexto("");
    setNickname("");
    setAudioUri(null);
    setSound(null);
    setMedia(null);
    setMediaType(null);
    setCancion(null);
    setSelectedDate(new Date());
    setBaul(false);
    setEnableRecuerdoDate(false);
    setGaleriaSubType("Texto");
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
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          translucent={false}
          backgroundColor="transparent"
        />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={60} // Ajusta este valor según la altura de tu header
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {/* Título */}
            <Text style={styles.titulo}>Crear Nueva Entrada</Text>

            {/* Campo de Apodo */}
            <Text style={styles.label}>Apodo de la Entrada</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa un apodo"
              placeholderTextColor={COLORS.placeholder}
              value={nickname}
              onChangeText={setNickname}
            />

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
                setGaleriaSubType("Texto");
              }}
              tintColor={COLORS.secondary}
              style={styles.segmentedControl}
              fontStyle={{ color: COLORS.text }}
              activeFontStyle={{ color: COLORS.surface, fontWeight: "700" }}
            />

            {/* Renderizar contenido basado en el tipo seleccionado */}
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
                      <MaterialIcons name="close" size={24} color="#fff" />
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
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </Pressable>
                  </View>
                )}
                {!media && (
                  <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={seleccionarMedia}
                  >
                    <Entypo name="image" size={50} color={COLORS.secondary} />
                    <Text style={styles.galleryButtonText}>
                      Seleccionar Media
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Subtipo para Galería: Texto o Audio */}
                <Text style={styles.label}>Añadir:</Text>
                <SegmentedControl
                  values={["Texto", "Audio"]}
                  selectedIndex={["Texto", "Audio"].indexOf(galeriaSubType)}
                  onChange={(event) => {
                    const index = event.nativeEvent.selectedSegmentIndex;
                    const subtype = ["Texto", "Audio"][index];
                    setGaleriaSubType(subtype);
                    if (subtype === "Texto") {
                      setAudioUri(null);
                    } else {
                      setTexto("");
                    }
                  }}
                  tintColor={COLORS.secondary}
                  style={styles.subSegmentedControl}
                  fontStyle={{ color: COLORS.text }}
                  activeFontStyle={{ color: COLORS.surface, fontWeight: "700" }}
                />

                {/* Campo de Texto o Audio para Galería */}
                {galeriaSubType === "Texto" ? (
                  <View style={styles.textoContainer}>
                    <TextInput
                      style={styles.inputTexto}
                      multiline
                      numberOfLines={4}
                      placeholder="Añade un comentario"
                      placeholderTextColor={COLORS.placeholder}
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
                        <Pressable onPress={eliminarAudio}>
                          <MaterialIcons
                            name="close"
                            size={20}
                            color={COLORS.delete}
                          />
                        </Pressable>
                      </View>
                    )}
                  </View>
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
                      placeholderTextColor={COLORS.placeholder}
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
                    <Text style={styles.trackNameSelect}>{cancion.name}</Text>
                    <Text style={styles.trackArtistSelect}>
                      {cancion.artist}
                    </Text>
                    <Pressable
                      style={styles.eliminarIcono}
                      onPress={eliminarCancion}
                    >
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {selectedType === "Texto" && (
              <View style={styles.textoContainer}>
                <TextInput
                  style={styles.inputTexto}
                  multiline
                  numberOfLines={4}
                  placeholder="Añade un comentario"
                  placeholderTextColor={COLORS.placeholder}
                  value={texto}
                  onChangeText={setTexto}
                  scrollEnabled={true}
                />
              </View>
            )}

            {selectedType === "Audio" && (
              <View style={styles.audioModeContainer}>
                <AudioRecorder onRecordingComplete={manejarGrabacionCompleta} />
                {audioUri && (
                  <View style={styles.audioPreview}>
                    <Text style={styles.audioText}>Audio Grabado</Text>
                    <Pressable onPress={eliminarAudio}>
                      <MaterialIcons
                        name="close"
                        size={20}
                        color={COLORS.delete}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            )}

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

            {/* Botones de Acción */}
            <View style={styles.botonContainer}>
              <Pressable style={[styles.botonGuardar]} onPress={handleGuardar}>
                <Text style={styles.botonTexto}>Guardar</Text>
              </Pressable>
              <Pressable
                style={[styles.botonCancelar]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.botonTexto}>Cancelar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// Estilos para react-native-picker-select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingRight: 30,
    backgroundColor: COLORS.surface,
    width: "100%",
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    color: COLORS.text,
    paddingRight: 30,
    backgroundColor: COLORS.surface,
    width: "100%",
    marginBottom: 15,
  },
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // Superposición ligera para mejorar la legibilidad
    marginTop: 60,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Fondo semi-transparente más claro
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40, // Espacio extra para evitar que los botones queden ocultos
  },
  titulo: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
    color: COLORS.text,
    fontSize: 16,
    textAlign: "left",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    width: "100%",
    marginBottom: 15,
    fontSize: 16,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    backgroundColor: COLORS.surface,
    height: 120,
    width: "100%",
    marginBottom: 15,
    color: COLORS.text,
    fontSize: 16,
  },
  segmentedControl: {
    marginBottom: 15,
    width: "100%",
    height: 45,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  subSegmentedControl: {
    marginBottom: 15,
    width: "100%",
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  botonContainer: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  botonCancelar: {
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  botonTexto: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 16,
  },
  mediaContainer: {
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#e0e0e0",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  galleryButton: {
    alignSelf: "center",
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: "dashed",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryButtonText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.text,
    textAlign: "center",
  },
  spotifyContainer: {
    width: "100%",
    marginVertical: 15,
    position: "relative",
  },
  spotifyResultsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    elevation: 5,
    maxHeight: 250,
    zIndex: 10,
  },
  spotifyResults: {
    paddingHorizontal: 20,
  },
  trackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: COLORS.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trackImage: {
    width: 60,
    height: 60,
    marginRight: 20,
    borderRadius: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.text,
  },
  trackArtist: {
    color: "#666",
    fontSize: 14,
    marginTop: 6,
  },
  trackNameSelect: {
    fontWeight: "700",
    fontSize: 18,
    color: COLORS.text,
    marginTop: 10,
    textAlign: "center",
  },
  trackArtistSelect: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
    marginTop: 4,
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
    marginTop: 15,
  },
  audioText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
});

export default EntryScreen;
