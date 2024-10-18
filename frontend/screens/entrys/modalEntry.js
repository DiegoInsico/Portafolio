import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  Alert,
  Switch,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import { Video } from 'expo-av';
import { FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import axios from 'axios';

const ModalEntry = ({ visible, onClose }) => {
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [texto, setTexto] = useState('');
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isBaul, setIsBaul] = useState(false);
  const [isAudioMode, setIsAudioMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState([]);
  const [isSpotifyMode, setIsSpotifyMode] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();

  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (mediaStatus !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder a la galería.');
        }

        const { status: audioStatus } = await Audio.requestPermissionsAsync();
        if (audioStatus !== 'granted') {
          Alert.alert('Permiso requerido', 'Se necesitan permisos para acceder al micrófono.');
        }
      }
    })();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (audioRecording) {
        audioRecording.stopAndUnloadAsync();
      }
    };
  }, []);

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

        if (type === 'image') {
          setMediaType('image');
          setMedia(selectedMedia);
        } else if (type === 'video') {
          setMediaType('video');
          setMedia(selectedMedia);
        } else {
          Alert.alert('Tipo de medio no soportado', 'Por favor, selecciona una imagen o un video.');
        }
      }
    } catch (error) {
      console.log('Error al seleccionar media:', error);
      Alert.alert('Error', 'Hubo un problema al seleccionar el medio.');
    }
  };

  const eliminarMedia = () => {
    setMedia(null);
    setMediaType(null);
  };

  // Función para buscar canciones en Spotify usando Axios
  const buscarCancionesSpotify = async (query) => {
    try {
      const response = await axios.get(`http://10.0.2.2:3000/spotify/search`, {
        params: {
          query: query,
        },
      });
      setSpotifyResults(response.data); // Guardar los resultados de Spotify
    } catch (error) {
      console.error('Error al buscar canciones en Spotify:', error);
    }
  };

  const iniciarGrabacion = async () => {
    try {
      if (audioRecording) {
        await audioRecording.stopAndUnloadAsync();
        setAudioRecording(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setAudioRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.log('Error al iniciar la grabación:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación de audio.');
    }
  };

  const detenerGrabacion = async () => {
    try {
      if (audioRecording) {
        setIsRecording(false);
        await audioRecording.stopAndUnloadAsync();
        const uri = audioRecording.getURI();
        setAudioRecording({ uri });
      }
    } catch (error) {
      console.log('Error al detener la grabación:', error);
      Alert.alert('Error', 'No se pudo detener la grabación de audio.');
    }
  };

  const reproducirAudio = async () => {
    try {
      if (audioRecording && audioRecording.uri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioRecording.uri },
          {
            shouldPlay: true,
            progressUpdateIntervalMillis: 100,
            positionMillis: 0,
            onPlaybackStatusUpdate: (status) => {
              if (status.isLoaded) {
                setAudioDuration(status.durationMillis);
                setAudioPosition(status.positionMillis);
                setIsPlaying(status.isPlaying);

                // Actualizar barra de progreso
                Animated.timing(progressAnim, {
                  toValue: status.positionMillis / status.durationMillis,
                  duration: 100,
                  useNativeDriver: false,
                }).start();
              }

              if (status.didJustFinish) {
                setIsPlaying(false);
              }
            },
          }
        );

        setSound(sound);
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error al reproducir audio:', error);
      Alert.alert('Error', 'No se pudo reproducir el audio.');
    }
  };

  const pausarAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const eliminarAudio = () => {
    setAudioRecording(null);
    setIsPlaying(false);
    setAudioDuration(0);
    setAudioPosition(0);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  };

  const handleGuardar = async () => {
    if (!categoria) {
      Alert.alert('Error', 'Por favor, selecciona una categoría.');
      return;
    }

    if (!texto && !media && !audioRecording) {
      Alert.alert('Error', 'Por favor, agrega al menos un contenido a la entrada.');
      return;
    }

    const nuevaEntrada = {
      categoria,
      descripcion,
      texto,
      audio: audioRecording,
      media,
      mediaType,
      isBaul,
      fechaRecuerdo: categoria === 'recuerdo' ? selectedDate : null,
    };
    console.log('Nueva Entrada:', nuevaEntrada);

    setCategoria('');
    setDescripcion('');
    setTexto('');
    setAudioRecording(null);
    setSound(null);
    setMedia(null);
    setMediaType(null);
    setIsBaul(false);
    setSelectedDate(new Date());
    onClose();
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    if (currentDate < today) {
      setSelectedDate(currentDate);
    } else {
      Alert.alert('Error', 'La fecha debe ser anterior a hoy.');
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

          {/* Switch para alternar entre medios locales y Spotify */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Seleccionar desde:</Text>
            <View style={styles.switchWrapper}>
              <Text style={{ marginRight: 10 }}>Imagen/Video</Text>
              <Switch
                value={isSpotifyMode}
                onValueChange={() => setIsSpotifyMode(!isSpotifyMode)}
              />
              <Text style={{ marginLeft: 10 }}>Spotify</Text>
            </View>
          </View>

          {/* Campo de búsqueda para Spotify */}
          {isSpotifyMode && (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Buscar canción en Spotify"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (text.length > 2) {
                    buscarCancionesSpotify(text);
                  }
                }}
              />
            </View>
          )}

          {/* Mostrar resultados de Spotify */}
          {isSpotifyMode && spotifyResults.length > 0 && (
            <View>
              {spotifyResults.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  onPress={() => setMedia(track)}
                >
                  <View style={styles.trackContainer}>
                    <Image
                      source={{ uri: track.album.images[0].url }}
                      style={styles.trackImage}
                    />
                    <View>
                      <Text style={styles.trackName}>{track.name}</Text>
                      <Text style={styles.trackArtist}>{track.artists[0].name}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Botón para seleccionar imagen o video */}
          {!media && !isSpotifyMode && (
            <TouchableOpacity
              style={styles.iconoGaleria}
              onPress={seleccionarMedia}
            >
              <Entypo name="image" size={50} color="#007BFF" />
            </TouchableOpacity>
          )}

          {/* Vista Previa de Media */}
          {media && mediaType === 'image' && (
            <View style={styles.mediaContainer}>
              <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
              <TouchableOpacity style={styles.eliminarIcono} onPress={eliminarMedia}>
                <MaterialIcons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          {media && mediaType === 'video' && (
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
              <TouchableOpacity style={styles.eliminarIcono} onPress={eliminarMedia}>
                <MaterialIcons name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}

          {/* Switch entre Texto y Audio */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Modo de Entrada:</Text>
            <View style={styles.switchWrapper}>
              <Text style={{ marginRight: 10 }}>Texto</Text>
              <Switch
                value={isAudioMode}
                onValueChange={() => setIsAudioMode(!isAudioMode)}
              />
              <Text style={{ marginLeft: 10 }}>Audio</Text>
            </View>
          </View>

          {/* Campo de Texto o Modo de Audio */}
          <View style={styles.inputContainer}>
            {!isAudioMode ? (
              // Modo de Texto
              <View style={styles.textoContainer}>
                <Text style={styles.label}>Texto:</Text>
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
              <View style={styles.audioContainer}>
                <TouchableOpacity
                  style={styles.botonAudio}
                  onPress={isRecording ? detenerGrabacion : iniciarGrabacion}
                >
                  <FontAwesome
                    name="microphone"
                    size={30}
                    color={isRecording ? 'red' : '#007BFF'}
                  />
                </TouchableOpacity>
                {audioRecording && !isRecording && (
                  <View style={styles.audioPlaybackContainer}>
                    <TouchableOpacity onPress={isPlaying ? pausarAudio : reproducirAudio}>
                      <MaterialIcons name={isPlaying ? 'pause' : 'play-arrow'} size={30} color="#17a2b8" />
                    </TouchableOpacity>
                    <View style={styles.progressBarContainer}>
                      <Animated.View style={[styles.progressBar, {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0%", "100%"]
                        })
                      }]} />
                    </View>
                    <Text style={styles.audioTime}>
                      {Math.floor(audioPosition / 1000)} s / {Math.floor(audioDuration / 1000)} s
                    </Text>
                    <TouchableOpacity onPress={eliminarAudio} style={styles.botonEliminarAudio}>
                      <MaterialIcons name="delete" size={30} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Categoría */}
          <Text style={styles.label}>Categoría:</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setCategoria(value);
              if (value === 'recuerdo') {
                setShowDatePicker(true);
              }
            }}
            items={[
              { label: 'Selecciona una categoría', value: '' },
              { label: 'Viaje', value: 'viaje' },
              { label: 'Evento', value: 'evento' },
              { label: 'Personal', value: 'personal' },
              { label: 'Recuerdo', value: 'recuerdo' },
            ]}
            placeholder={{
              label: 'Selecciona una categoría',
              value: '',
              color: '#9EA0A4',
            }}
            style={pickerSelectStyles}
            value={categoria}
          />

          {/* Mostrar DatePicker si se selecciona "Recuerdo" */}
          {categoria === 'recuerdo' && (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text style={styles.label}>Seleccionar Fecha del Recuerdo</Text>
              </TouchableOpacity>
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

          {/* Descripción */}
          <Text style={styles.label}>Descripción:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Agrega una descripción"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Switch del Baúl */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>¿Agregar al Baúl?</Text>
            <Switch
              value={isBaul}
              onValueChange={() => setIsBaul(!isBaul)}
            />
          </View>

          {/* Imagen del Baúl Abierto/Cerrado */}
          {isBaul ? (
            <Image source={require('../../assets/test/baul.webp')} style={styles.baulImagen} />
          ) : (
            <Image source={require('../../assets/test/baulCerrado.webp')} style={styles.baulImagen} />
          )}

          {/* Botones de Guardar y Cancelar */}
          <View style={styles.botonContainer}>
            <TouchableOpacity
              style={styles.botonGuardar}
              onPress={handleGuardar}
            >
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.botonCancelar}
              onPress={onClose}
            >
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  inputTexto: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
    height: 100,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  botonGuardar: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    elevation: 3,
  },
  botonCancelar: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    elevation: 3,
  },
  botonTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  botonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  iconoGaleria: {
    alignSelf: 'center',
    marginVertical: 15,
  },
  baulImagen: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginVertical: 15,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    marginTop: 10,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  eliminarIcono: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
    borderRadius: 15,
  },
  trackContainer: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  trackImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  trackName: {
    fontWeight: 'bold',
  },
  trackArtist: {
    color: 'gray',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  botonAudio: {
    marginRight: 15,
  },
  audioPlaybackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressBarContainer: {
    flex: 1,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#17a2b8',
  },
  audioTime: {
    color: '#555',
    marginRight: 10,
  },
  botonEliminarAudio: {
    marginLeft: 10,
  },
});

// Estilos para react-native-picker-select
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#f9f9f9',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 5,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#f9f9f9',
  },
});

export default ModalEntry;
