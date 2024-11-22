// EntryDetailScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Card,
  Paragraph,
  Button,
  Avatar,
  Dialog,
  Portal,
  TextInput,
  Switch,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  updateDoc,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Video } from "expo-av";
import AudioPlayer from "../../components/audioPlayer";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";

// Función para determinar el color del texto basado en el color de fondo
const getContrastingTextColor = (bgColor) => {
  // Extraer los componentes RGB del color
  const color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calcular la luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

const EntryDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { item, beneficiaries } = route.params || {};

  // Estados
  const [addBeneficiary, setAddBeneficiary] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [beneficiary, setBeneficiary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Estados para reflexiones
  const [reflexiones, setReflexiones] = useState([]);
  const [isReflexionModalVisible, setIsReflexionModalVisible] = useState(false);
  const [isAddReflexionModalVisible, setIsAddReflexionModalVisible] =
    useState(false);
  const [nuevaReflexion, setNuevaReflexion] = useState("");

  // Formateo de fechas
  const creationDateTime = item.fechaCreacion
    ? new Date(item.fechaCreacion.seconds * 1000)
    : null;

  const formattedCreationDate = creationDateTime
    ? creationDateTime.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  const formattedCreationTime = creationDateTime
    ? creationDateTime.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Hora no disponible";

  // Obtener color de la categoría desde la base de datos
  const categoryColor = item.color || "#000"; // Color por defecto si no está definido
  const buttonTextColor = getContrastingTextColor(categoryColor);

  // Efecto para obtener beneficiario
  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (item.beneficiary && item.beneficiary.id) {
        setIsLoading(true);
        try {
          const beneficiaryRef = doc(db, "beneficiarios", item.beneficiary.id);
          const beneficiarySnap = await getDoc(beneficiaryRef);
          setBeneficiary(
            beneficiarySnap.exists() ? beneficiarySnap.data() : null
          );
        } catch (error) {
          console.error("Error al obtener beneficiario:", error);
          Alert.alert("Error", "No se pudo obtener el beneficiario asignado.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBeneficiary();
  }, [item]);

  // Efecto para obtener reflexiones
  useEffect(() => {
    const fetchReflexiones = () => {
      if (item.id) {
        const reflexionesRef = collection(
          db,
          "entradas",
          item.id,
          "reflexiones"
        );
        const q = query(reflexionesRef, orderBy("fecha", "desc"));

        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const reflexionesList = [];
            querySnapshot.forEach((doc) => {
              reflexionesList.push({ id: doc.id, ...doc.data() });
            });
            setReflexiones(reflexionesList);
          },
          (error) => {
            console.error("Error al obtener reflexiones:", error);
            Alert.alert("Error", "No se pudieron obtener las reflexiones.");
          }
        );

        return () => unsubscribe();
      }
    };

    fetchReflexiones();
  }, [item.id]);

  // Asignar beneficiario
  const handleAssignBeneficiary = async () => {
    if (!selectedBeneficiary) {
      Alert.alert("Error", "Por favor, selecciona un beneficiario.");
      return;
    }

    try {
      const beneficiaryData = beneficiaries.find(
        (beneficiary) => beneficiary.id === selectedBeneficiary
      );

      if (!beneficiaryData) {
        Alert.alert("Error", "Beneficiario no encontrado.");
        return;
      }

      const entryRef = doc(db, "entradas", item.id);
      await updateDoc(entryRef, {
        beneficiary: {
          id: beneficiaryData.id,
          name: beneficiaryData.name,
          email: beneficiaryData.email,
          profileImage: beneficiaryData.profileImage,
        },
      });

      Alert.alert("Éxito", "Beneficiario asignado correctamente.");
      setBeneficiary(beneficiaryData);
      setAddBeneficiary(false);
      setSelectedBeneficiary("");
    } catch (error) {
      console.error("Error al asignar beneficiario: ", error);
      Alert.alert("Error", "Ocurrió un error al asignar el beneficiario.");
    }
  };

  // Eliminar beneficiario
  const handleRemoveBeneficiary = async () => {
    Alert.alert(
      "Confirmar",
      "¿Estás seguro de que deseas eliminar el beneficiario asignado?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const entryRef = doc(db, "entradas", item.id);
              await updateDoc(entryRef, { beneficiary: null });
              Alert.alert("Éxito", "Beneficiario eliminado correctamente.");
              setBeneficiary(null);
            } catch (error) {
              console.error("Error al eliminar beneficiario:", error);
              Alert.alert(
                "Error",
                "Ocurrió un error al eliminar el beneficiario."
              );
            }
          },
        },
      ]
    );
  };

  // Agregar reflexión
  const handleAgregarReflexion = async () => {
    if (!nuevaReflexion.trim()) {
      Alert.alert("Error", "La reflexión no puede estar vacía.");
      return;
    }

    try {
      const reflexionesRef = collection(db, "entradas", item.id, "reflexiones");
      await addDoc(reflexionesRef, {
        texto: nuevaReflexion.trim(),
        fecha: new Date(),
      });
      Alert.alert("Éxito", "Reflexión agregada correctamente.");
      setNuevaReflexion("");
      setIsAddReflexionModalVisible(false);
    } catch (error) {
      console.error("Error al agregar reflexión:", error);
      Alert.alert("Error", "Ocurrió un error al agregar la reflexión.");
    }
  };

  // Renderizar contenido de la entrada
  const renderEntryContent = () => {
    if (item.media && item.mediaType === "image") {
      return (
        <Card style={[styles.card]}>
          <Card.Cover
            source={
              !imageError && item.media
                ? { uri: item.media }
                : require("../../assets/images/placeholder.png")
            }
            style={styles.cardImage}
            onError={() => setImageError(true)}
          />
          {item.texto && (
            <Card.Content>
              <Paragraph style={styles.cardText}>{item.texto}</Paragraph>
            </Card.Content>
          )}
        </Card>
      );
    } else if (item.media && item.mediaType === "video") {
      return (
        <Card style={[styles.card, { backgroundColor: "#1E1E1E" }]}>
          <Card.Content style={styles.videoContainer}>
            <Video
              source={{ uri: item.media }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          </Card.Content>
          {item.texto && (
            <Card.Content>
              <Paragraph style={styles.cardText}>{item.texto}</Paragraph>
            </Card.Content>
          )}
        </Card>
      );
    } else if (item.cancion) {
      return (
        <Card style={[styles.cardSpotify, { backgroundColor: "#1E1E1E" }]}>
          <View style={styles.spotifyContent}>
            <Avatar.Image
              size={60}
              source={
                item.cancion.albumImage
                  ? { uri: item.cancion.albumImage }
                  : require("../../assets/images/placeholder.png")
              }
            />
            <View style={styles.spotifyInfo}>
              <Text style={styles.spotifyTitle}>{item.cancion.name}</Text>
              <Text style={styles.spotifySubtitle}>{item.cancion.artist}</Text>
            </View>
          </View>
          {item.texto && (
            <Card.Content>
              <Paragraph style={styles.cardText}>{item.texto}</Paragraph>
            </Card.Content>
          )}
          {(item.cancion.previewUrl || item.cancion.audioUri || item.audio) && (
            <Card.Content>
              <AudioPlayer
                audioUri={
                  item.cancion.previewUrl || item.cancion.audioUri || item.audio
                }
              />
            </Card.Content>
          )}
        </Card>
      );
    } else if (item.audio) {
      return (
        <Card style={[styles.card, { backgroundColor: "#1E1E1E" }]}>
          <Card.Content>
            <AudioPlayer audioUri={item.audio} />
          </Card.Content>
          {item.texto && (
            <Card.Content>
              <Paragraph style={styles.cardText}>{item.texto}</Paragraph>
            </Card.Content>
          )}
        </Card>
      );
    } else if (item.texto) {
      return (
        <Card style={[styles.card, { backgroundColor: "#1E1E1E" }]}>
          <Card.Content>
            <Paragraph style={styles.cardText}>{item.texto}</Paragraph>
          </Card.Content>
        </Card>
      );
    } else {
      return (
        <Card style={[styles.card, { backgroundColor: "#1E1E1E" }]}>
          <Card.Content>
            <Paragraph style={styles.noContentText}>
              No hay contenido disponible
            </Paragraph>
          </Card.Content>
        </Card>
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: categoryColor, alignItems: "center" },
      ]}
    >
      {/* Contenedor Principal con 90% de ancho */}
      <View style={styles.mainContainer}>
        {/* Encabezado con Fondo Negro */}
        <View style={styles.headerBackground}>
          {/* Fecha de creación */}
          <Text style={styles.creationDate}>
            Creado el {formattedCreationDate} a las {formattedCreationTime}
          </Text>
          {/* Línea Divisoria */}
          <Divider style={styles.divider} />

          {/* Información General */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contenido</Text>
            {/* Contenido de la entrada */}
            {renderEntryContent()}
          </View>

          {/* Línea Divisoria */}
          <Divider style={styles.divider} />

          {/* Reflexiones */}
          <View style={styles.reflectionsHeader}>
            <Text style={styles.reflectionsTitle}>
              Reflexiones ({reflexiones.length})
            </Text>
            <Button
              icon="plus"
              onPress={() => setIsAddReflexionModalVisible(true)}
              style={[
                styles.addReflectionButton,
                { backgroundColor: categoryColor },
              ]}
              labelStyle={{ color: textColor }}
              accessibilityLabel="Añadir reflexión"
              accessibilityHint="Abre un diálogo para agregar una nueva reflexión"
            >
            </Button>
          </View>
          {reflexiones.length > 0 ? (
            <Button
              mode="outlined"
              onPress={() => setIsReflexionModalVisible(true)}
              style={[
                styles.viewReflectionsButton,
                { backgroundColor: categoryColor },
              ]}
              labelStyle={{ color: textColor }}
              uppercase={false}
              accessibilityLabel="Ver reflexiones"
              accessibilityHint="Abre un diálogo para ver todas las reflexiones"
            >
              Ver Reflexiones
            </Button>
          ) : (
            <Text style={styles.noReflectionsText}>
              No hay reflexiones aún.
            </Text>
          )}

          <View style={styles.beneficiarySection}>
            {isLoading ? (
              <ActivityIndicator animating={true} color={categoryColor} />
            ) : (
              <View style={styles.beneficiaryCard}>
                {/* Foto del beneficiario */}
                <Avatar.Image
                  size={60}
                  source={
                    beneficiary?.profileImage
                      ? { uri: beneficiary.profileImage }
                      : require("../../assets/images/placeholder.png")
                  }
                  style={styles.beneficiaryAvatar}
                />

                {/* Información del beneficiario */}
                <View style={styles.beneficiaryInfo}>
                  <Text style={styles.beneficiaryName}>
                    {beneficiary ? beneficiary.name : "Sin beneficiario"}
                  </Text>
                  <Text style={styles.beneficiaryEmail}>
                    {beneficiary
                      ? beneficiary.email
                      : "Selecciona un beneficiario."}
                  </Text>
                </View>

                {/* Acciones cuando hay beneficiario */}
                {beneficiary && (
                  <View style={styles.beneficiaryActions}>
                    <Button
                      mode="contained"
                      onPress={handleRemoveBeneficiary} // Elimina el beneficiario asignado
                      style={[styles.beneficiaryButton, styles.removeButton]}
                    >
                      X
                    </Button>
                  </View>
                )}
                {/* Picker cuando no hay beneficiario o se selecciona "Cambiar" */}
                {!beneficiary || addBeneficiary ? (
                  <Picker
                    selectedValue={selectedBeneficiary}
                    onValueChange={async (itemValue) => {
                      setSelectedBeneficiary(itemValue);
                      const beneficiaryData = beneficiaries.find(
                        (b) => b.id === itemValue
                      );
                      if (beneficiaryData) {
                        try {
                          const entryRef = doc(db, "entradas", item.id);
                          await updateDoc(entryRef, {
                            beneficiary: {
                              id: beneficiaryData.id,
                              name: beneficiaryData.name,
                              email: beneficiaryData.email,
                              profileImage: beneficiaryData.profileImage,
                            },
                          });
                          setBeneficiary(beneficiaryData);
                          setAddBeneficiary(false);
                          Alert.alert(
                            "Éxito",
                            "Beneficiario asignado correctamente."
                          );
                        } catch (error) {
                          console.error(
                            "Error al asignar beneficiario: ",
                            error
                          );
                          Alert.alert(
                            "Error",
                            "No se pudo asignar el beneficiario."
                          );
                        }
                      }
                    }}
                    style={styles.fullWidthPicker}
                    dropdownIconColor="#666"
                    itemStyle={{ color: "#000", height: 50 }}
                  >
                    <Picker.Item label="Selecciona un beneficiario" value="" />
                    {beneficiaries.map((b) => (
                      <Picker.Item key={b.id} label={b.name} value={b.id} />
                    ))}
                  </Picker>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* Modal para listar reflexiones */}
        <Portal>
          <Dialog
            visible={isReflexionModalVisible}
            onDismiss={() => setIsReflexionModalVisible(false)}
            style={styles.dialogContainer}
          >
            <Dialog.Title style={{ color: textColor }}>
              Listado de Reflexiones
            </Dialog.Title>
            <Dialog.Content>
              {reflexiones.map((reflexion) => (
                <Card
                  key={reflexion.id}
                  style={[styles.reflexionCard, { backgroundColor: "#2C2C2C" }]}
                >
                  <Card.Content>
                    <Paragraph style={styles.reflexionTexto}>
                      {reflexion.texto}
                    </Paragraph>
                    <Text style={styles.reflexionFecha}>
                      {reflexion.fecha
                        ? new Date(
                            reflexion.fecha.seconds * 1000
                          ).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Fecha no disponible"}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
              {reflexiones.length === 0 && (
                <Text style={styles.noReflectionsText}>
                  No hay reflexiones aún.
                </Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setIsReflexionModalVisible(false)}
                mode="contained"
                style={[
                  styles.fullWidthButtonR,
                  { backgroundColor: categoryColor },
                ]}
                labelStyle={{ color: buttonTextColor }}
                accessibilityLabel="Cerrar reflexiones"
                accessibilityHint="Cierra el listado de reflexiones"
              >
                Cerrar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Modal para agregar una reflexión */}
        <Portal>
          <Dialog
            visible={isAddReflexionModalVisible}
            onDismiss={() => setIsAddReflexionModalVisible(false)}
            style={styles.dialogContainer}
          >
            <Dialog.Title style={{ color: textColor }}>
              Agregar Reflexión
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Escribe tu reflexión aquí"
                value={nuevaReflexion}
                onChangeText={setNuevaReflexion}
                style={styles.fullWidthTextInput}
                theme={{
                  colors: { text: "#0000", primary: categoryColor },
                }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setIsAddReflexionModalVisible(false)}
                mode="contained"
                style={[
                  styles.fullWidthButton,
                  { backgroundColor: categoryColor },
                ]}
                labelStyle={{ color: buttonTextColor }}
                accessibilityLabel="Cancelar agregar reflexión"
                accessibilityHint="Cancela la acción de agregar una nueva reflexión"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleAgregarReflexion}
                mode="contained"
                style={[
                  styles.fullWidthButton,
                  { backgroundColor: categoryColor },
                ]}
                labelStyle={{ color: buttonTextColor }}
                accessibilityLabel="Guardar reflexión"
                accessibilityHint="Guarda la nueva reflexión agregada"
              >
                Guardar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ScrollView>
  );
};

// Color global para el texto
const textColor = "#fff"; // Cambiar este valor para ajustar el color del texto en toda la pantalla

const styles = StyleSheet.create({
  // Contenedor principal del ScrollView
  scrollContainer: {
    padding: 0,
    flexGrow: 1,
  },

  // Contenedor principal del contenido
  mainContainer: {
    width: "90%",
    alignItems: "center",
    paddingVertical: 80,
  },

  // Contenedor genérico para la pantalla
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212", // Fondo oscuro si no hay entrada
    flex: 1,
  },

  // Texto de error
  errorText: {
    color: "#E74C3C", // Rojo para errores
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },

  // Fondo del encabezado
  headerBackground: {
    backgroundColor: "#1E1E1E", // Fondo negro
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
  },

  // Contenedor del encabezado
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    position: "relative",
  },

  // Título del encabezado
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: textColor,
    textAlign: "center",
  },

  // Botón para cerrar
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 6,
    borderRadius: 20,
  },

  // Línea divisoria
  divider: {
    marginTop: 10,
    backgroundColor: "#444444",
    height: 1,
    width: "100%",
  },

  // Fecha de creación
  creationDate: {
    fontSize: 14,
    color: "#BBBBBB",
    marginVertical: 15,
    textAlign: "center",
    width: "100%",
  },

  // Contenedor de secciones generales
  section: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },

  // Título de cada sección
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: textColor,
    marginBottom: 10,
    textAlign: "center",
    width: "100%",
  },

  // Estilo genérico de tarjetas
  card: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },

  // Imagen dentro de las tarjetas
  cardImage: {
    height: 200,
  },

  // Texto dentro de las tarjetas
  cardText: {
    fontSize: 16,
    color: textColor,
    textAlign: "justify",
    marginTop: 10,
  },

  // Contenedor de videos
  videoContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#000000",
    borderRadius: 10,
    overflow: "hidden",
  },

  // Estilo del video
  video: {
    width: "100%",
    height: "100%",
  },

  // Contenedor de reflexiones
  reflectionsContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Encabezado de reflexiones
  reflectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },

  // Título de reflexiones
  reflectionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: textColor,
  },

  // Botón para añadir reflexiones
  addReflectionButton: {
    flex: 1,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    width: 20,
  },

  // Botón para ver reflexiones
  viewReflectionsButton: {
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
  },

  // Texto cuando no hay reflexiones
  noReflectionsText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },

  // Contenedor del beneficiario
  beneficiaryContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Tarjeta del beneficiario
  beneficiaryCard: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1E1E1E",
    marginBottom: 10,
  },

  // Texto de ayuda para el beneficiario
  beneficiaryPrompt: {
    fontSize: 18,
    color: textColor,
    marginBottom: 10,
    textAlign: "center",
  },

  // Estilo genérico de los Picker
  picker: {
    height: 50,
    width: "100%",
    color: textColor,
    backgroundColor: "#333333",
    borderRadius: 8,
    marginBottom: 10,
  },

  // Picker en toda la pantalla
  fullWidthPicker: {
    height: 20,
    width: "15%",
    color: textColor,
    borderRadius: 10,
  },

  // Botón para asignar algo
  assignButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },

  // Tarjeta para reflexiones
  reflexionCard: {
    marginBottom: 10,
    backgroundColor: "#2C2C2C",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },

  // Texto de reflexiones
  reflexionTexto: {
    fontSize: 16,
    color: textColor,
    marginBottom: 5,
  },

  // Fecha de reflexiones
  reflexionFecha: {
    fontSize: 12,
    color: "#AAAAAA",
    textAlign: "right",
  },

  // Entrada de texto
  textInput: {
    height: 100,
    borderColor: "#555555",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: textColor,
    backgroundColor: "#2C2C2C",
    marginBottom: 15,
    textAlignVertical: "top",
  },

  // Entrada de texto a ancho completo
  fullWidthTextInput: {
    height: 100,
    borderColor: "#555555",
    borderRadius: 5,
    color: textColor,
    marginBottom: 15,
    textAlignVertical: "top",
    width: "100%",
  },

  // Botón para cerrar modal
  closeModalButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },

  // Texto cuando no hay contenido
  noContentText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },

  // Botón para cambiar algo
  changeButton: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
    marginBottom: 10,
  },

  // Botón para eliminar algo
  removeButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
  },

  // Botón a ancho completo
  fullWidthButton: {
    width: "50%",
    borderRadius: 5,
    marginBottom: 10,
  },

  // Botón Cerrar Reflexion ancho completo
  fullWidthButtonR: {
    width: "100%",
    borderRadius: 5,
    marginBottom: 10,
  },

  // Botón para cancelar
  cancelChangeButton: {
    marginTop: 10,
    color: "#888888",
    width: "100%",
  },

  // Acciones dentro de una tarjeta
  cardActions: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  // Tarjeta estilo Spotify
  cardSpotify: {
    width: "100%",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  // Contenido estilo Spotify
  spotifyContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  // Información estilo Spotify
  spotifyInfo: {
    marginLeft: 15,
    flex: 1,
  },

  // Título estilo Spotify
  spotifyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: textColor,
  },

  // Subtítulo estilo Spotify
  spotifySubtitle: {
    fontSize: 14,
    color: "#BBBBBB",
  },

  // Contenedor de modales
  dialogContainer: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#1E1E1E",
  },

  // Estilos para la sección de beneficiarios
  beneficiarySection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8", // Fondo claro para contraste
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  beneficiaryCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  beneficiaryAvatar: {
    backgroundColor: "#CCCCCC", // Fondo gris si no hay imagen
    marginRight: 10,
  },

  beneficiaryInfo: {
    flex: 1,
    justifyContent: "center",
  },

  beneficiaryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  beneficiaryEmail: {
    fontSize: 14,
    color: "#666",
  },

  beneficiaryActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  beneficiaryButton: {
    marginHorizontal: 5,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },

  removeButton: {
    backgroundColor: "#E74C3C", // Rojo para eliminar
  },

  changeButton: {
    backgroundColor: "#3498DB", // Azul para cambiar
  },

  addButton: {
    backgroundColor: "#2ECC71", // Verde para agregar
  },

  beneficiaryButtonLabel: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});

export default EntryDetailScreen;
