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
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [baul, setBaul] = useState(false); // Nuevo estado para "baul"
  const [cancion, setCancion] = useState(null); // Estado para canción de Spotify
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
          // Al seleccionar una imagen, limpiamos Spotify y audio/texto si es necesario
          setIsSpotifyMode(false);
          setCancion(null); // Limpia cualquier canción seleccionada
          setAudioUri(null);
          setTexto("");
        } else if (type === "video") {
          setMediaType("video");
          setMedia(selectedMedia);
          // Al seleccionar un video, limpiamos Spotify y audio/texto si es necesario
          setIsSpotifyMode(false);
          setCancion(null); // Limpia cualquier canción seleccionada
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
        `http://192.168.100.43:3000/spotify/search`,
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

    // Verificar si el usuario está autenticado
    if (!user) {
      Alert.alert(
        "Error",
        "No hay un usuario autenticado. Por favor, inicia sesión."
      );
      return;
    }

    try {
      const auth = getAuth(); // Obtener la instancia de autenticación
      const user = auth.currentUser; // Obtener el usuario autenticado

      // Verificar si el usuario está autenticado
      if (!user) {
        Alert.alert(
          "Error",
          "No hay un usuario autenticado. Por favor, inicia sesión."
        );
        return;
      }

      let mediaURL = null;
      let audioURL = null;
      let cancionData = null;

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

      // Construir nuevaEntrada asegurando la exclusividad
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
        fechaRecuerdo: categoria === "recuerdo" ? selectedDate : null,
      };

      // Asignar cancion, media y luego audio o texto según corresponda
      if (cancionData) {
        nuevaEntrada.cancion = cancionData;
      } else if (mediaURL) {
        nuevaEntrada.media = mediaURL;
        nuevaEntrada.mediaType = mediaType;
      }

      // Asignar audio o texto, asegurando que no coexistan
      if (audioURL) {
        nuevaEntrada.audio = audioURL;
      } else if (texto) {
        nuevaEntrada.texto = texto;
      }

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, "entradas"), nuevaEntrada);
      console.log("Documento escrito con ID: ", docRef.id);

      // Resetear el formulario
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
      onClose();
    } catch (error) {
      console.error("Error al guardar la entrada: ", error);
      Alert.alert(
        "Error",
        "Hubo un problema al guardar la entrada. Por favor, intenta de nuevo."
      );
    }
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.titulo}>Crear Nueva Entrada</Text>

          {/* Switch para alternar entre Galeria/Video y Spotify */}
          <CustomSwitch
            style={styles.switchItem}
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
                          // setIsSpotifyMode(false); // Eliminado para mantener el switch en Spotify
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
            style={styles.switchItem}
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
                  placeholder="Escribe tu texto aquí"
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
            <Text>Dale color a tus emociones</Text>
            <ColorPicker
              selectedColor={selectedColor}
              onColorSelect={(color) => {
                setSelectedColor(color); // Actualiza el color seleccionado fuera del modal si es necesario
              }}
            />
          </View>

          {/* Categoría */}
          <Text style={styles.label}>Categoría:</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setCategoria(value);
              if (value === "recuerdo") {
                setShowDatePicker(true);
              } else {
                setShowDatePicker(false);
              }
            }}
            items={[
              { label: "Selecciona una categoría", value: "" },
              { label: "Viaje", value: "Viaje" },
              { label: "Evento", value: "Evento" },
              { label: "Personal", value: "Personal" },
              { label: "Recuerdo", value: "Recuerdo" },
            ]}
            placeholder={{
              label: "Selecciona una categoría",
              value: "",
              color: "#9EA0A4",
            }}
            style={pickerSelectStyles}
            value={categoria}
          />

          {/* Mostrar DatePicker si se selecciona "Recuerdo" */}
          {categoria === "recuerdo" && (
            <>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerPressable}
              >
                <Text style={styles.label}>Seleccionar Fecha del Recuerdo</Text>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  maximumDate={today}
                />
              )}
            </>
          )}

          {/* Switch para "baul" */}
          <View style={styles.switchBaulContainer}>
            <Text style={styles.label}>¿Guardar en el baúl?</Text>
            <Switch
              value={baul}
              onValueChange={setBaul}
              thumbColor={baul ? "#4CAF50" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {/* Botones de Guardar y Cancelar */}
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
  /* ====== Modal Styles ====== */
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  /* ====== Text Styles ====== */
  titulo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600",
    color: "#555",
  },

  /* ====== Input Styles ====== */
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 10,
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#f9f9f9",
    height: 100,
    marginTop: 5,
    width: "100%",
    marginBottom: 10,
  },

  /* ====== Switch Content Container ====== */
  switchContentContainer: {
    height: 150, // Altura fija para evitar cambios en la altura del modal
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
  },
  textoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  audioModeContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ====== Botón Styles ====== */
  botonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  botonGuardar: {
    backgroundColor: "#28a745",
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
    color: "#fff",
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
    height: 220, // Altura fija para la vista previa de medios
    marginBottom: 10,
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover", // Asegura que la imagen cubra el contenedor
  },
  trackImageSelect: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    resizeMode: "cover", // Asegura que la imagen cubra el contenedor
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
    position: "relative", // Necesario para posicionar el contenedor de resultados absolutamente
    marginBottom: 10,
  },
  spotifyResultsContainer: {
    position: "absolute",
    top: 50, // Ajusta según la altura del TextInput
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    maxHeight: 200, // Altura máxima para mostrar aproximadamente 5 resultados
    zIndex: 10, // Asegura que esté por encima de otros componentes
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
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
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
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 5,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#f9f9f9",
    width: "100%",
    marginBottom: 10,
  },
});

export default ModalEntry;
