// EntryItem.js

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

const EntryItem = ({ item, onClose, beneficiaries }) => {
  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No hay datos disponibles para esta entrada.
        </Text>
        <Button
          mode="contained"
          onPress={onClose}
          style={styles.fullWidthButton}
          accessibilityLabel="Cerrar detalle de entrada"
          accessibilityHint="Cierra el detalle de la entrada actual"
        >
          Cerrar
        </Button>
      </View>
    );
  }

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

  // Estados para fecha de recuerdo
  const [enableRecuerdoDate, setEnableRecuerdoDate] = useState(false);
  const [recuerdoDate, setRecuerdoDate] = useState(null);
  const [showRecuerdoDatePicker, setShowRecuerdoDatePicker] = useState(false);

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
  const categoryColor = item.color || "#1E1E1E"; // Color por defecto si no está definido
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

  // Efecto para obtener fecha de recuerdo
  useEffect(() => {
    const fetchRecuerdoDate = async () => {
      if (item.fechaRecuerdo) {
        setEnableRecuerdoDate(true);
        setRecuerdoDate(item.fechaRecuerdo.toDate());
      }
    };

    fetchRecuerdoDate();
  }, [item.fechaRecuerdo]);

  // Manejador de cambio de fecha de recuerdo
  const onChangeRecuerdoDate = (event, selectedDate) => {
    setShowRecuerdoDatePicker(false);
    if (selectedDate) {
      setRecuerdoDate(selectedDate);
      asignarFechaRecuerdo(selectedDate);
    }
  };

  // Asignar fecha de recuerdo
  const asignarFechaRecuerdo = async (date) => {
    try {
      const entryRef = doc(db, "entradas", item.id);
      await updateDoc(entryRef, {
        fechaRecuerdo: date,
      });
      Alert.alert("Éxito", "Fecha de recuerdo actualizada correctamente.");
    } catch (error) {
      console.error("Error al asignar fecha de recuerdo:", error);
      Alert.alert("Error", "Ocurrió un error al asignar la fecha de recuerdo.");
    }
  };

  // Eliminar fecha de recuerdo
  const eliminarFechaRecuerdo = async () => {
    try {
      const entryRef = doc(db, "entradas", item.id);
      await updateDoc(entryRef, {
        fechaRecuerdo: null,
      });
      setEnableRecuerdoDate(false);
      setRecuerdoDate(null);
      Alert.alert("Éxito", "Fecha de recuerdo eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar fecha de recuerdo:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al eliminar la fecha de recuerdo."
      );
    }
  };

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
      const reflexionesRef = collection(
        db,
        "entradas",
        item.id,
        "reflexiones"
      );
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
        <Card style={[styles.card, { backgroundColor: "#1E1E1E" }]}>
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
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Detalle de la Entrada</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: categoryColor }]}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={24} color={buttonTextColor} />
            </TouchableOpacity>
          </View>
          {/* Fecha de creación */}
          <Text style={styles.creationDate}>
            Creado el: {formattedCreationDate} a las {formattedCreationTime}
          </Text>
          {/* Línea Divisoria */}
          <Divider style={styles.divider} />
        </View>

        {/* Contenido de la entrada */}
        <View style={styles.entryContentContainer}>{renderEntryContent()}</View>

        {/* Reflexiones */}
        <View style={styles.reflectionsContainer}>
          <View style={styles.reflectionsHeader}>
            <Text style={styles.reflectionsTitle}>
              Reflexiones ({reflexiones.length})
            </Text>
            <Button
              icon="plus"
              mode="contained"
              onPress={() => setIsAddReflexionModalVisible(true)}
              style={[
                styles.addReflectionButton,
                { backgroundColor: categoryColor },
              ]}
              labelStyle={{ color: buttonTextColor }}
              contentStyle={{ flexDirection: "row-reverse" }}
              accessibilityLabel="Añadir reflexión"
              accessibilityHint="Abre un diálogo para agregar una nueva reflexión"
            >
              Añadir
            </Button>
          </View>
          {reflexiones.length > 0 ? (
            <Button
              mode="outlined"
              onPress={() => setIsReflexionModalVisible(true)}
              style={[
                styles.viewReflectionsButton,
                { borderColor: categoryColor, backgroundColor: "#1E1E1E" },
              ]}
              labelStyle={{ color: categoryColor }}
              uppercase={false}
              accessibilityLabel="Ver reflexiones"
              accessibilityHint="Abre un diálogo para ver todas las reflexiones"
            >
              Ver Reflexiones
            </Button>
          ) : (
            <Text style={styles.noReflectionsText}>No hay reflexiones aún.</Text>
          )}
        </View>

        {/* Beneficiario */}
        <View style={styles.beneficiaryContainer}>
          {isLoading ? (
            <ActivityIndicator animating={true} color={categoryColor} />
          ) : beneficiary ? (
            <>
              {!addBeneficiary ? (
                <Card
                  style={[
                    styles.beneficiaryCard,
                    { backgroundColor: categoryColor },
                  ]}
                >
                  <Card.Title
                    title={beneficiary.name}
                    subtitle={beneficiary.email}
                    titleStyle={{ color: buttonTextColor }}
                    subtitleStyle={{
                      color: getContrastingTextColor(categoryColor),
                    }}
                    left={(props) =>
                      beneficiary.profileImage ? (
                        <Avatar.Image
                          size={40}
                          source={{ uri: beneficiary.profileImage }}
                        />
                      ) : (
                        <Avatar.Icon
                          size={40}
                          icon="account"
                          color={buttonTextColor}
                          style={{ backgroundColor: "transparent" }}
                        />
                      )
                    }
                  />
                  <Card.Actions style={styles.cardActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setAddBeneficiary(true)}
                      style={[
                        styles.fullWidthButton,
                        { borderColor: categoryColor, marginRight: 10 },
                      ]}
                      labelStyle={{ color: buttonTextColor }}
                      accessibilityLabel="Cambiar beneficiario"
                      accessibilityHint="Abre opciones para cambiar el beneficiario asignado"
                    >
                      Cambiar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleRemoveBeneficiary}
                      style={[styles.fullWidthButton, styles.removeButton]}
                      labelStyle={{ color: "#FFFFFF" }}
                      accessibilityLabel="Eliminar beneficiario"
                      accessibilityHint="Elimina el beneficiario asignado a esta entrada"
                    >
                      Eliminar
                    </Button>
                  </Card.Actions>
                </Card>
              ) : (
                <Card
                  style={[
                    styles.beneficiaryCard,
                    { backgroundColor: "#1E1E1E" },
                  ]}
                >
                  <Card.Content>
                    <Text style={styles.beneficiaryPrompt}>
                      Cambiar Beneficiario
                    </Text>
                    <Picker
                      selectedValue={selectedBeneficiary}
                      onValueChange={(itemValue) =>
                        setSelectedBeneficiary(itemValue)
                      }
                      style={styles.fullWidthPicker}
                      dropdownIconColor={categoryColor}
                      itemStyle={{ color: "#FFFFFF", height: 50 }}
                      accessibilityLabel="Selector de beneficiarios"
                      accessibilityHint="Selecciona un beneficiario de la lista"
                    >
                      <Picker.Item
                        label="Selecciona un beneficiario"
                        value=""
                      />
                      {beneficiaries.length > 0 ? (
                        beneficiaries.map((beneficiary) => (
                          <Picker.Item
                            key={beneficiary.id}
                            label={beneficiary.name}
                            value={beneficiary.id}
                          />
                        ))
                      ) : (
                        <Picker.Item
                          label="No hay beneficiarios disponibles"
                          value=""
                        />
                      )}
                    </Picker>
                    <Button
                      mode="contained"
                      onPress={handleAssignBeneficiary}
                      style={[
                        styles.fullWidthButton,
                        { backgroundColor: categoryColor, marginBottom: 10 },
                      ]}
                      labelStyle={{ color: buttonTextColor }}
                      accessibilityLabel="Asignar beneficiario"
                      accessibilityHint="Asigna el beneficiario seleccionado a esta entrada"
                    >
                      Asignar
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => setAddBeneficiary(false)}
                      style={styles.cancelChangeButton}
                      labelStyle={{ color: "#888888" }}
                      accessibilityLabel="Cancelar cambio de beneficiario"
                      accessibilityHint="Cancela el cambio de beneficiario"
                    >
                      Cancelar
                    </Button>
                  </Card.Content>
                </Card>
              )}
            </>
          ) : (
            <Card
              style={[
                styles.beneficiaryCard,
                { backgroundColor: "#1E1E1E" },
              ]}
            >
              <Card.Content>
                <Text style={styles.beneficiaryPrompt}>
                  ¿Agregar Beneficiario?
                </Text>
                <Picker
                  selectedValue={selectedBeneficiary}
                  onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                  style={styles.fullWidthPicker}
                  dropdownIconColor={categoryColor}
                  itemStyle={{ color: "#FFFFFF", height: 50 }}
                  accessibilityLabel="Selector de beneficiarios"
                  accessibilityHint="Selecciona un beneficiario de la lista"
                >
                  <Picker.Item
                    label="Selecciona un beneficiario"
                    value=""
                  />
                  {beneficiaries.length > 0 ? (
                    beneficiaries.map((beneficiary) => (
                      <Picker.Item
                        key={beneficiary.id}
                        label={beneficiary.name}
                        value={beneficiary.id}
                      />
                    ))
                  ) : (
                    <Picker.Item
                      label="No hay beneficiarios disponibles"
                      value=""
                    />
                  )}
                </Picker>
                <Button
                  mode="contained"
                  onPress={handleAssignBeneficiary}
                  style={[
                    styles.fullWidthButton,
                    { backgroundColor: categoryColor },
                  ]}
                  labelStyle={{ color: buttonTextColor }}
                  accessibilityLabel="Asignar beneficiario"
                  accessibilityHint="Asigna el beneficiario seleccionado a esta entrada"
                >
                  Asignar
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Modal para listar reflexiones */}
        <Portal>
          <Dialog
            visible={isReflexionModalVisible}
            onDismiss={() => setIsReflexionModalVisible(false)}
            style={{ backgroundColor: categoryColor }}
          >
            <Dialog.Title style={{ color: buttonTextColor }}>
              Listado de Reflexiones
            </Dialog.Title>
            <Dialog.Content>
              {reflexiones.map((reflexion) => (
                <Card
                  key={reflexion.id}
                  style={[
                    styles.reflexionCard,
                    { backgroundColor: "#2C2C2C" },
                  ]}
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
                style={{ color: buttonTextColor }}
                mode="text"
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
            style={{ backgroundColor: categoryColor }}
          >
            <Dialog.Title style={{ color: buttonTextColor }}>
              Agregar Reflexión
            </Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Escribe tu reflexión aquí"
                mode="outlined"
                multiline
                numberOfLines={4}
                value={nuevaReflexion}
                onChangeText={setNuevaReflexion}
                style={styles.fullWidthTextInput}
                theme={{
                  colors: { text: "#FFFFFF", primary: categoryColor },
                }}
                accessibilityLabel="Campo de texto para reflexión"
                accessibilityHint="Escribe una nueva reflexión para esta entrada"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                onPress={() => setIsAddReflexionModalVisible(false)}
                style={{ color: buttonTextColor }}
                mode="text"
              >
                Cancelar
              </Button>
              <Button
                onPress={handleAgregarReflexion}
                style={{ color: buttonTextColor }}
                mode="text"
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

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 0,
    flexGrow: 1,
  },
  mainContainer: {
    width: "90%",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#121212", // Fondo oscuro si no hay entrada
    flex: 1,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  headerBackground: {
    backgroundColor: "#000000", // Fondo negro para el encabezado
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
    borderRadius: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF", // Texto blanco para fondo negro
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 6,
    borderRadius: 20,
  },
  divider: {
    marginTop: 10,
    backgroundColor: "#444444",
    height: 1,
    width: "100%",
  },
  creationDate: {
    fontSize: 14,
    color: "#BBBBBB",
    marginVertical: 15,
    textAlign: "center",
    width: "100%",
  },
  entryContentContainer: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    padding: 10,
  },
  card: {
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
  cardImage: {
    height: 200,
  },
  cardText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "justify",
    marginTop: 10,
  },
  videoContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#000000",
    borderRadius: 10,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  reflectionsContainer: {
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
  reflectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  reflectionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addReflectionButton: {
    borderRadius: 5,
    width: "100%", // Ocupa todo el ancho disponible
  },
  viewReflectionsButton: {
    marginTop: 10,
    width: "100%",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    backgroundColor: "#1E1E1E",
  },
  noReflectionsText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
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
  beneficiaryCard: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1E1E1E", // Fondo predeterminado, se puede sobrescribir dinámicamente
  },
  beneficiaryPrompt: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#FFFFFF",
    backgroundColor: "#333333",
    borderRadius: 8,
    marginBottom: 10,
  },
  fullWidthPicker: {
    height: 50,
    width: "100%",
    color: "#FFFFFF",
    backgroundColor: "#333333",
    borderRadius: 8,
    marginBottom: 10,
  },
  assignButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  reflexionCard: {
    marginBottom: 10,
    backgroundColor: "#2C2C2C",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  reflexionTexto: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 5,
  },
  reflexionFecha: {
    fontSize: 12,
    color: "#AAAAAA",
    textAlign: "right",
  },
  textInput: {
    height: 100,
    borderColor: "#555555",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: "#FFFFFF",
    backgroundColor: "#2C2C2C",
    marginBottom: 15,
    textAlignVertical: "top",
  },
  fullWidthTextInput: {
    height: 100,
    borderColor: "#555555",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: "#FFFFFF",
    backgroundColor: "#2C2C2C",
    marginBottom: 15,
    textAlignVertical: "top",
    width: "100%",
  },
  closeModalButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  noContentText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  changeButton: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%", // Ocupa todo el ancho disponible
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%", // Ocupa todo el ancho disponible
  },
  fullWidthButton: {
    width: "100%", // Ocupa todo el ancho disponible
    borderRadius: 5,
    marginBottom: 10,
  },
  cancelChangeButton: {
    marginTop: 10,
    color: "#888888",
    width: "100%",
  },
  cardActions: {
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  // Spotify-like music card
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
  spotifyContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  spotifyInfo: {
    marginLeft: 15,
    flex: 1,
  },
  spotifyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  spotifySubtitle: {
    fontSize: 14,
    color: "#BBBBBB",
  },
});

export default EntryItem;
