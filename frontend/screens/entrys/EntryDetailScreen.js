// EntryDetailScreen.js

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Avatar,
  Dialog,
  Portal,
  TextInput,
  ActivityIndicator,
  Menu,
  List,
} from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { updateDoc, doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../utils/firebase"; // Asegúrate de que la ruta es correcta
import { Video } from "expo-av"; // Importa Video desde expo-av
import AudioPlayer from "../../components/audioPlayer"; // Importación corregida

// Definir las categorías disponibles con sus iconos
const categorias = [
  { label: "Idea", value: "idea", icon: "lightbulb" },
  { label: "Consejo", value: "consejo", icon: "handshake" },
  {
    label: "Aprendizaje",
    value: "aprendizaje",
    icon: "book-open-page-variant",
  },
  { label: "Reflexión", value: "reflexion", icon: "thought-bubble" }, // Nueva categoría
  { label: "Otro", value: "otro", icon: "dots-horizontal" },
];

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

// Función para decodificar URIs doble codificadas
const decodeDoubleURI = (uri) => {
  try {
    return decodeURIComponent(decodeURIComponent(uri));
  } catch (e) {
    console.warn("Error al decodificar la URI:", e);
    return uri;
  }
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
  const [spotifyImageError, setSpotifyImageError] = useState(false);
  const [entryImageError, setEntryImageError] = useState(false);

  // Estados para reflexiones
  const [isAddReflexionModalVisible, setIsAddReflexionModalVisible] =
    useState(false);
  const [nuevaReflexion, setNuevaReflexion] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState(""); // Nuevo estado para la categoría
  const [categoriaError, setCategoriaError] = useState(""); // Estado para manejar errores de categoría

  // Estados para el menú de categorías
  const [menuVisible, setMenuVisible] = useState(false);

  // Función para abrir el menú
  const openMenu = () => setMenuVisible(true);

  // Función para cerrar el menú
  const closeMenu = () => setMenuVisible(false);

  // Obtener dimensiones de la pantalla para la imagen
  const { width } = Dimensions.get("window");

  // Verificar que 'item' existe
  if (!item) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>No se encontró la entrada.</Text>
      </View>
    );
  }

  // Formateo de fechas (si aplica)
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
  const categoryColor = item.color || "#1E90FF"; // Color por defecto si no está definido
  const textColor = getContrastingTextColor(categoryColor); // Para textos sobre fondo oscuro

  // Obtener el icono de la categoría seleccionada
  const selectedCategoriaIcon =
    categorias.find((cat) => cat.value === selectedCategoria)?.icon || "folder";

  // Efecto para obtener beneficiario asignado
  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (item.beneficiary && item.beneficiary.id) {
        setIsLoading(true);
        try {
          const beneficiaryRef = doc(db, "beneficiarios", item.beneficiary.id);
          const beneficiarySnap = await getDoc(beneficiaryRef);
          if (beneficiarySnap.exists()) {
            const data = beneficiarySnap.data();
            setBeneficiary(data);
          } else {
            setBeneficiary(null);
          }
        } catch (error) {
          console.error("Error al obtener beneficiario:", error);
          Alert.alert("Error", "No se pudo obtener el beneficiario asignado.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setBeneficiary(null);
      }
    };

    fetchBeneficiary();
  }, [item]);

  // Asignar o cambiar beneficiario
  const handleAssignBeneficiary = async () => {
    if (!selectedBeneficiary) {
      Alert.alert("Error", "Por favor, selecciona un beneficiario.");
      return;
    }

    try {
      const beneficiaryData = beneficiaries.find(
        (ben) => ben.id === selectedBeneficiary
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
    // Validar que la categoría esté seleccionada
    if (!selectedCategoria) {
      setCategoriaError("Por favor, selecciona una categoría.");
      return;
    }

    // Validar que la reflexión no esté vacía
    if (!nuevaReflexion.trim()) {
      Alert.alert("Error", "La reflexión no puede estar vacía.");
      return;
    }

    try {
      const reflexionesRef = collection(db, "entradas", item.id, "reflexiones");
      await addDoc(reflexionesRef, {
        texto: nuevaReflexion.trim(),
        categoria: selectedCategoria, // Agregar la categoría
        fecha: new Date(),
      });
      Alert.alert("Éxito", "Reflexión agregada correctamente.");
      setNuevaReflexion("");
      setSelectedCategoria(""); // Resetear la categoría seleccionada
      setIsAddReflexionModalVisible(false);
    } catch (error) {
      console.error("Error al agregar reflexión:", error);
      Alert.alert("Error", "Ocurrió un error al agregar la reflexión.");
    }
  };

  // Función para renderizar el contenido principal (texto, audio, etc.)
  const renderEntryContent = () => {
    const isSpotifyEntry = item.cancion && item.cancion.albumImage;

    return (
      <View>
        {isSpotifyEntry && (
          <View style={styles.spotifyContainer}>
            {!spotifyImageError ? (
              <Image
                source={{ uri: item.cancion.albumImage }}
                style={styles.spotifyImage}
                onError={() => setSpotifyImageError(true)}
              />
            ) : (
              // Placeholder personalizado en caso de error
              <View style={[styles.spotifyImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>Imagen no disponible</Text>
              </View>
            )}
            <View style={styles.spotifyOverlay}>
              <Text style={styles.spotifySongName}>{item.cancion.name}</Text>
              <Text style={styles.spotifyAuthors}>{item.cancion.artist}</Text>
            </View>
          </View>
        )}

        {item.mediaType === "image" && item.media && (
          <View>
            {!entryImageError ? (
              <Image
                source={{ uri: item.media }}
                style={styles.entryImage}
                onError={() => setEntryImageError(true)}
              />
            ) : (
              // Placeholder personalizado en caso de error
              <View style={[styles.entryImage, styles.imagePlaceholder]}>
                <Text style={styles.placeholderText}>Imagen no disponible</Text>
              </View>
            )}
          </View>
        )}

        {item.mediaType === "video" && item.media && (
          <Video
            source={{ uri: item.media }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={false}
            useNativeControls
            style={styles.video}
          />
        )}

        {item.audio && <AudioPlayer audioUri={item.audio} />}

        {item.texto && (
          <View style={[styles.textBackground, styles.contentContainer]}>
            <Text style={[styles.mediaText, { color: "#fff" }]}>
              {item.texto}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { backgroundColor: categoryColor }, // Establecer backgroundColor a categoryColor
      ]}
    >
      <View style={styles.mainContainer}>
        {/* Contenedor con fondo oscuro y bordes redondeados */}
        <View style={[styles.contentWrapper, { backgroundColor: "#1E1E1E" }]}>
          {/* Título de la entrada */}
          <Text style={styles.title}>
            {item.nickname || "Título de la Entrada"}{" "}
            {/* "Ice Caves" si es el nickname */}
          </Text>

          {/* Descripción o contenido */}
          {renderEntryContent()}

          {/* Beneficiarios */}
          <View style={styles.beneficiariesContainer}>
            <View style={styles.beneficiaryHeader}>
              <Text style={styles.sectionTitle}>Beneficiario</Text>
              <View style={styles.beneficiaryButtons}>
                {beneficiary ? (
                  <>
                    <Button
                      mode="text"
                      onPress={() => setAddBeneficiary(true)}
                      style={styles.button}
                      icon="pencil"
                      labelStyle={{ color: "#fff" }}
                    >
                      Cambiar
                    </Button>
                    <Button
                      mode="text"
                      onPress={handleRemoveBeneficiary}
                      style={styles.button}
                      icon="trash-can"
                      color="#E74C3C"
                    >
                      Eliminar
                    </Button>
                  </>
                ) : (
                  <Button
                    mode="text"
                    onPress={() => setAddBeneficiary(true)}
                    style={styles.button}
                    icon="plus"
                    labelStyle={{ color: "#fff" }}
                  >
                    Añadir
                  </Button>
                )}
              </View>
            </View>
            {beneficiary ? (
              <View style={styles.beneficiaryInfo}>
                {beneficiary.profileImage ? (
                  <Avatar.Image
                    size={50}
                    source={{ uri: beneficiary.profileImage }}
                    onError={() => {
                      Alert.alert(
                        "Error",
                        "No se pudo cargar la imagen del beneficiario."
                      );
                    }}
                  />
                ) : (
                  <Avatar.Icon size={50} icon="account" />
                )}
                <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
              </View>
            ) : (
              <View style={styles.beneficiaryInfo}>
                <Avatar.Icon size={50} icon="account" />
                <Text style={styles.beneficiaryName}>Sin beneficiario</Text>
              </View>
            )}
          </View>

          {/* Botones para Reflexiones */}
          <Text style={styles.sectionTitle}>Reflexiones</Text>
          <View style={styles.reflectionsButtonContainer}>
            <Button
              mode="contained"
              onPress={() => setIsAddReflexionModalVisible(true)}
              style={styles.addReflectionButton}
              icon="plus"
            >
              Agregar Reflexión
            </Button>
            <Button
              mode="outlined"
              onPress={() =>
                navigation.navigate("ReflexionListScreen", { entryId: item.id })
              }
              style={styles.viewReflectionsButton}
              icon="eye"
              labelStyle={{ color: "#fff" }}
            >
              Ver Reflexiones
            </Button>
          </View>
        </View>
      </View>

      {/* Modal para asignar o cambiar beneficiario */}
      <Portal>
        <Dialog
          visible={addBeneficiary}
          onDismiss={() => setAddBeneficiary(false)}
          style={styles.dialogContainer}
        >
          <Dialog.Title>Añadir Beneficiario</Dialog.Title>
          <Dialog.Content>
            <Picker
              selectedValue={selectedBeneficiary}
              onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Selecciona un beneficiario" value="" />
              {beneficiaries.map((ben) => (
                <Picker.Item key={ben.id} label={ben.name} value={ben.id} />
              ))}
            </Picker>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddBeneficiary(false)}>Cancelar</Button>
            <Button onPress={handleAssignBeneficiary}>Asignar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Modal para agregar una reflexión */}
      <Portal>
        <Dialog
          visible={isAddReflexionModalVisible}
          onDismiss={() => {
            setIsAddReflexionModalVisible(false);
            setCategoriaError(""); // Limpiar errores al cerrar el modal
          }}
          style={styles.dialogContainer}
        >
          <Dialog.Title>Agregar Reflexión</Dialog.Title>
          <Dialog.Content>
            {/* Selector de Categoría Personalizado */}
            <Text style={styles.inputLabel}>Categoría:</Text>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <TouchableOpacity onPress={openMenu} style={styles.menuAnchor}>
                  <List.Icon icon={selectedCategoriaIcon} />
                  <Text style={styles.selectedCategoriaText}>
                    {selectedCategoria
                      ? categorias.find(
                          (cat) => cat.value === selectedCategoria
                        )?.label
                      : "-- Selecciona una categoría --"}
                  </Text>
                  <List.Icon icon="chevron-down" />
                </TouchableOpacity>
              }
            >
              {categorias.map((categoria) => (
                <Menu.Item
                  key={categoria.value}
                  leadingIcon={categoria.icon}
                  title={categoria.label}
                  onPress={() => {
                    setSelectedCategoria(categoria.value);
                    setCategoriaError("");
                    closeMenu();
                  }}
                />
              ))}
            </Menu>
            {categoriaError ? (
              <Text style={styles.errorText}>{categoriaError}</Text>
            ) : null}

            {/* Campo de Texto para la Reflexión */}
            <TextInput
              label="Escribe tu reflexión aquí"
              value={nuevaReflexion}
              onChangeText={setNuevaReflexion}
              style={styles.fullWidthTextInput}
              theme={{
                colors: { text: "#000000", primary: categoryColor },
              }}
              multiline
              numberOfLines={4}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setIsAddReflexionModalVisible(false);
                setCategoriaError("");
              }}
            >
              Cancelar
            </Button>
            <Button onPress={handleAgregarReflexion}>Guardar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Mostrar cargando si está cargando */}
      {isLoading && (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loadingIndicator}
          color="#758E4F"
        />
      )}
    </ScrollView>
  );
};

// Definición de estilos corregida y mejorada
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: "#1E1E1E", // Fondo oscuro
  },
  mainContainer: {
    alignItems: "center",
    paddingVertical: 10,
    width: "100%",
    paddingTop: 70,
  },
  contentWrapper: {
    width: "100%",
    backgroundColor: "#2C2C2C", // Fondo oscuro
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FFFFFF",
  },
  textBackground: {
    backgroundColor: "#444444", // Fondo más oscuro
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  contentContainer: {
    width: "100%",
  },
  mediaText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  entryImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    marginBottom: 15,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  audioContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  beneficiariesContainer: {
    width: "100%",
    marginBottom: 20,
  },
  beneficiaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  beneficiaryButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  button: {
    marginHorizontal: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#444",
  },
  beneficiaryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  beneficiaryName: {
    marginLeft: 10,
    fontSize: 16,
    color: "#FFFFFF",
  },
  reflectionsButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  addReflectionButton: {
    backgroundColor: "#444",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
  viewReflectionsButton: {
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
  dialogContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000000",
  },
  menuAnchor: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedCategoriaText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: "#000000",
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000000",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  spotifyContainer: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    position: "relative",
  },
  spotifyImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    resizeMode: "cover",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444",
    borderRadius: 10,
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  spotifyOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fondo translúcido
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  spotifySongName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  spotifyAuthors: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 2,
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -25, // Para centrar el ActivityIndicator
    marginTop: -25,
  },
  fullWidthTextInput: {
    width: "100%",
    marginTop: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EntryDetailScreen;
