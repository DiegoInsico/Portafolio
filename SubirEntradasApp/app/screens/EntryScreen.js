import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import ColorPicker from "../../components/ui/ColorPicker";
import { Audio, Video } from "expo-av";
import CustomSwitch from "../../components/ui/SwitchButton";
import AudioRecorder from "../../components/general/audioComponent";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import axios from "axios";
import { getAuth, signOut } from "firebase/auth";
import { db, storage } from "../../app/constants/firebaseConfig";
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

const EntryScreen = ({ navigation }) => {
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
  const [nivel, setNivel] = useState("1");
  const today = new Date();

  // Estado para almacenar la información del usuario
  const [userInfo, setUserInfo] = useState({
    displayName: "",
    photoURL: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserInfo({
        displayName: user.displayName || "Usuario",
        photoURL:
          user.photoURL ||
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y", // Imagen por defecto
      });
    }

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
    // Aquí puedes manejar el URI del audio grabado, por ejemplo, enviarlo a un servidor
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

    try {
      let mediaURL = null;
      let audioURL = null;
      let cancionData = null;
      let emociones = [];

      // Subir media (imagen o video) si existe y no es Spotify
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
        texto: null,
        audio: null,
        cancion: null,
        media: null,
        mediaType: null,
        color: selectedColor,
        baul,
        fechaCreacion: serverTimestamp(),
        fechaRecuerdo:
          categoria.toLowerCase() === "recuerdo" ? selectedDate : null,
        emociones, // Aquí guardamos las emociones detectadas
        nivel, // Nivel de profundidad
        isProtected: nivel === "2" || nivel === "3", // Seguridad adicional para niveles 2 y 3
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
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    if (currentDate < today) {
      setSelectedDate(currentDate);
    } else {
      Alert.alert("Error", "La fecha debe ser anterior a hoy.");
    }
  };

  // Función para cerrar sesión
  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      // Navegar a la pantalla de inicio de sesión
      navigation.replace("Login"); // Asegúrate de que "Login" es el nombre correcto de tu pantalla de inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión: ", error);
      Alert.alert(
        "Error",
        "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Configurar el StatusBar */}
      <StatusBar
        barStyle="light-content"
        translucent={false}
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../../assets/mensaje.jpg")} // Ruta a tu imagen de fondo
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Barra de Navegación */}
        <View style={styles.navbar}>
          {/* Imagen de Perfil */}
          <Image
            source={{ uri: userInfo.photoURL }}
            style={styles.profileImage}
          />
          {/* Nombre del Usuario */}
          <Text style={styles.userName}>{userInfo.displayName}</Text>
          {/* Botón de Cerrar Sesión */}
          <Pressable style={styles.signOutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="#ff4d4d" />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <Text style={styles.titulo}>Crear Nuevo Instante</Text>

            {/* Switch para alternar entre Galeria/Video y Spotify */}
            <CustomSwitch
              option1="Galeria"
              option2="Spotify"
              color1="#4CAF50" // Color cuando está en ON (Galeria/Video)
              color2="#007BFF" // Color cuando está en OFF (Spotify)
              value={isSpotifyMode}
              onSwitch={(value) => {
                setIsSpotifyMode(value);
                if (value) {
                  eliminarMedia(); // Limpia cualquier media seleccionada
                  eliminarCancion(); // Limpia cualquier canción seleccionada
                  setAudioUri(null); // Limpia audio si es necesario
                  setTexto(""); // Limpia texto si es necesario
                } else {
                  setSpotifyResults([]); // Limpia los resultados de Spotify
                }
              }}
            />

            {/* Campo de búsqueda para Spotify */}
            {isSpotifyMode && !cancion && (
              <View style={styles.spotifyContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Buscar canción en Spotify"
                  placeholderTextColor="#ccc" // Asegurar buena visibilidad sobre el fondo
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text.length > 2) {
                      buscarCancionesSpotify(text);
                    } else {
                      setSpotifyResults([]); // Limpiar resultados si el texto es menor o igual a 2
                    }
                  }}
                />

                {/* Mostrar resultados de Spotify solo si hay resultados y el campo de búsqueda no está vacío */}
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
                            setSearchQuery(""); // Limpiar el campo de búsqueda
                            setSpotifyResults([]); // Limpiar los resultados de búsqueda
                            setMedia(null); // Limpia cualquier media seleccionada
                            setMediaType(null);
                            setAudioUri(null); // Opcional: limpiar audio si es necesario
                            setTexto(""); // Opcional: limpiar texto si es necesario
                          }}
                        >
                          <View style={styles.trackContainer}>
                            <Image
                              source={{ uri: track.album.images[0].url }}
                              style={styles.trackImage}
                            />
                            <View>
                              <Text style={styles.trackName}>{track.name}</Text>
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
                <Text style={styles.trackArtistSelect}>{cancion.artist}</Text>
                <Pressable style={styles.eliminarIcono} onPress={eliminarCancion}>
                  <MaterialIcons name="close" size={24} color="red" />
                </Pressable>
              </View>
            )}

            {/* Vista Previa de Media */}
            {media && mediaType === "image" && (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
                <Pressable style={styles.eliminarIcono} onPress={eliminarMedia}>
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
                <Pressable style={styles.eliminarIcono} onPress={eliminarMedia}>
                  <MaterialIcons name="close" size={24} color="red" />
                </Pressable>
              </View>
            )}
            {!media && !isSpotifyMode && (
              <Pressable style={styles.iconoGaleria} onPress={seleccionarMedia}>
                <Entypo name="image" size={50} color="#007BFF" />
              </Pressable>
            )}

            {/* Switch entre Texto y Audio */}
            <CustomSwitch
              option1="Texto"
              option2="Audio"
              color1="#007BFF" // Color cuando está en OFF (Texto)
              color2="#4CAF50" // Color cuando está en ON (Audio)
              value={isAudioMode}
              onSwitch={(value) => {
                setIsAudioMode(value);
                if (value) {
                  setTexto(""); // Limpia el texto si se activa el modo Audio
                } else {
                  setAudioUri(null);
                  setSound(null);
                }
              }}
            />

            {/* Campo de Texto o Modo de Audio */}
            <View style={styles.switchContentContainer}>
              {!isAudioMode ? (
                // Modo de Texto
                <View style={styles.textoContainer}>
                  <TextInput
                    style={styles.inputTexto}
                    multiline
                    numberOfLines={4}
                    placeholder="Cuéntame algo"
                    placeholderTextColor="#999" // Asegurar buena visibilidad sobre el fondo
                    value={texto}
                    onChangeText={setTexto}
                  />
                </View>
              ) : (
                // Modo de Audio
                <View style={styles.audioModeContainer}>
                  <AudioRecorder onRecordingComplete={manejarGrabacionCompleta} />
                </View>
              )}
            </View>

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
              style={pickerSelectStyles} // Uso correcto de pickerSelectStyles
              value={nivel}
            />

            {/* Categoría */}
            <Text style={styles.label}>Categoría</Text>
            <RNPickerSelect
              onValueChange={(value) => {
                setCategoria(value);
                if (value.toLowerCase() === "recuerdo") {
                  setShowDatePicker(true);
                } else {
                  setShowDatePicker(false);
                }
              }}
              items={[
                { label: "Viaje", value: "Viaje" },
                { label: "Evento", value: "Evento" },
                { label: "Personal", value: "Personal" },
                { label: "Recuerdo", value: "Recuerdo" },
                { label: "Reflexión", value: "Reflexión" },
                { label: "Meta Alcanzada", value: "Meta Alcanzada" },
                { label: "Consejo", value: "Consejo" },
                { label: "Secreto", value: "Secreto" },
                { label: "Gratitud", value: "Gratitud" },
                { label: "Sueño", value: "Sueño" },
                { label: "Amistad", value: "Amistad" },
                { label: "Amor", value: "Amor" },
                { label: "Logro", value: "Logro" },
                { label: "Inspiración", value: "Inspiración" },
                { label: "Música", value: "Música" },
                { label: "Fotografía", value: "Fotografía" },
                { label: "Anécdota", value: "Anécdota" },
                { label: "Cumpleaños", value: "Cumpleaños" },
                { label: "Aprendizaje", value: "Aprendizaje" },
                { label: "Meditación", value: "Meditación" },
                { label: "Pensamiento", value: "Pensamiento" },
                { label: "Familia", value: "Familia" },
                { label: "Desafío", value: "Desafío" },
                { label: "Sueño Cumplido", value: "Sueño Cumplido" },
                { label: "Aventura", value: "Aventura" },
                { label: "Relación", value: "Relación" },
                { label: "Filosofía de Vida", value: "Filosofía de Vida" },
                { label: "Oración", value: "Oración" },
                { label: "Propuesta", value: "Propuesta" },
                { label: "Pérdida", value: "Pérdida" },
                { label: "Milagro", value: "Milagro" },
                { label: "Salud", value: "Salud" },
                { label: "Reconciliación", value: "Reconciliación" },
                { label: "Celebración", value: "Celebración" },
              ]}
              placeholder={{
                label: "Selecciona una categoría",
                value: "",
                color: "#9EA0A4",
              }}
              style={pickerSelectStyles} // Uso correcto de pickerSelectStyles
              value={categoria}
            />

            {/* DatePicker para Recuerdos */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
                maximumDate={today}
              />
            )}

            {/* Botones de Guardar */}
            <View style={styles.botonContainer}>
              <Pressable style={styles.botonGuardar} onPress={handleGuardar}>
                <Text style={styles.botonTexto}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

// Estilos principales
const styles = StyleSheet.create({
  /* ====== Safe Area Styles ====== */
  safeArea: {
    flex: 1,
    backgroundColor: "#000", // Color de fondo para evitar espacios transparentes
  },

  /* ====== Background Styles ====== */
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  /* ====== Navbar Styles ====== */
  navbar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente para mejor visibilidad
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  userName: {
    flex: 1,
    marginLeft: 10,
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    padding: 5,
  },
  signOutText: {
    color: "#FFD700",
    fontWeight: "600",
    fontSize: 16,
  },

  /* ====== Container Styles ====== */
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    padding: 20,
    alignItems: "center",
  },

  /* ====== Text Styles ====== */
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#FFD700",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
    color: "#FFD700",
  },

  /* ====== Input Styles ====== */
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "rgba(44, 62, 80, 0.8)", // Ajuste para mejor visibilidad sobre el fondo
    color: "#FFF",
    width: "100%",
    marginBottom: 10,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Ajuste para mejor visibilidad sobre el fondo
    height: 100,
    marginTop: 5,
    width: "100%",
    marginBottom: 10,
    color: "#333", // Color de texto para mejor legibilidad
  },

  /* ====== Switch Content Container ====== */
  switchContentContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
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

  /* ====== Botón Styles ====== */
  botonContainer: {
    flexDirection: "row",
    marginTop: 10,
    width: "100%",
  },
  botonGuardar: {
    backgroundColor: "#FFD700",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    elevation: 3,
    marginBottom: 10,
  },
  botonCancelar: {
    backgroundColor: "#6c757d",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    elevation: 3,
    marginBottom: 10,
  },
  botonTexto: {
    color: "#000000",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },

  /* ====== Media Styles ====== */
  mediaContainer: {
    alignItems: "center",
    position: "relative",
    width: "100%",
    marginTop: 10,
    height: 220,
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  trackImageSelect: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    resizeMode: "cover",
  },
  eliminarIcono: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 5,
    borderRadius: 15,
  },

  /* ====== Galería y Spotify Styles ====== */
  iconoGaleria: {
    alignSelf: "center",
    marginVertical: 15,
    marginBottom: 10,
  },
  spotifyContainer: {
    width: "100%",
    marginVertical: 10,
    position: "relative",
    marginBottom: 10,
  },
  spotifyResultsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    maxHeight: 200,
    zIndex: 10,
  },
  spotifyResults: {
    paddingHorizontal: 10,
  },
  trackContainer: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  trackImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
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
  trackNameSelect: {
    fontWeight: "bold",
    marginTop: 5,
    fontSize: 16,
    color: "#333",
  },
  trackArtistSelect: {
    color: "gray",
    fontSize: 14,
  },

  /* ====== Color Picker Styles ====== */
  pickerContent: {
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    width: "80%",
  },
  recuadroPicker: {
    marginBottom: 10,
    width: 60,
  },

  /* ====== Baúl Switch Styles ====== */
  switchBaulContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    marginBottom: 10,
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
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 5,
    color: "white",
    paddingRight: 30,
    backgroundColor: "rgba(44, 62, 80, 0.8)", // Ajuste para mejor visibilidad sobre el fondo
    width: "80%",
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#FFD700",
    borderRadius: 5,
    color: "white",
    paddingRight: 30,
    backgroundColor: "rgba(44, 62, 80, 0.8)", // Ajuste para mejor visibilidad sobre el fondo
    width: "100%",
    marginBottom: 10,
  },
});

export default EntryScreen;
