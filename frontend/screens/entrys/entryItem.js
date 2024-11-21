import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Switch,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from "react-native";
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
import { Video } from "expo-av"; // Asegúrate de importar Video
import AudioPlayer from "../../components/audioPlayer"; // Importa tu componente de audio
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const EntryItem = ({ item, onClose, beneficiaries }) => {
  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No hay datos disponibles para esta entrada.
        </Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
    );
  }

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

  const creationDateTime = item.fechaCreacion
    ? new Date(item.fechaCreacion.seconds * 1000)
    : null;

  const formattedCreationDate = creationDateTime
    ? creationDateTime.toLocaleDateString("es-ES")
    : "Fecha no disponible";

  const formattedCreationTime = creationDateTime
    ? creationDateTime.toLocaleTimeString()
    : "Hora no disponible";

  useEffect(() => {
    const fetchBeneficiary = async () => {
      if (item.beneficiary && item.beneficiary.id) {
        setIsLoading(true);
        try {
          const beneficiaryRef = doc(db, "beneficiarios", item.beneficiary.id);
          const beneficiarySnap = await getDoc(beneficiaryRef);
          setBeneficiary(beneficiarySnap.exists() ? beneficiarySnap.data() : null);
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

  useEffect(() => {
    const fetchReflexiones = () => {
      if (item.id) {
        const reflexionesRef = collection(db, "entradas", item.id, "reflexiones");
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

  useEffect(() => {
    const fetchRecuerdoDate = async () => {
      if (item.fechaRecuerdo) {
        setEnableRecuerdoDate(true);
        setRecuerdoDate(item.fechaRecuerdo.toDate());
      }
    };

    fetchRecuerdoDate();
  }, [item.fechaRecuerdo]);

  const onChangeRecuerdoDate = (event, selectedDate) => {
    setShowRecuerdoDatePicker(false);
    if (selectedDate) {
      setRecuerdoDate(selectedDate);
      asignarFechaRecuerdo(selectedDate);
    }
  };

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
      Alert.alert("Error", "Ocurrió un error al eliminar la fecha de recuerdo.");
    }
  };

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
              Alert.alert("Error", "Ocurrió un error al eliminar el beneficiario.");
            }
          },
        },
      ]
    );
  };

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

  const renderEntryContent = () => {
    console.log("URL de la imagen:", item.media); // Verificar la URL de la imagen
    if (item.media && item.mediaType === "image") {
      return (
        <View style={styles.entryContent}>
          <Image
            source={
              !imageError && item.media
                ? { uri: item.media }
                : require("../../assets/images/placeholder.png") // Imagen de marcador de posición
            }
            style={styles.fullImage}
            resizeMode="contain"
            onError={() => setImageError(true)} // Manejar error de carga de imagen
          />
          {item.texto && (
            <Text style={styles.fullText}>{item.texto}</Text>
          )}
        </View>
      );
    } else if (item.media && item.mediaType === "video") {
      return (
        <View style={styles.entryContent}>
          <Video
            source={{ uri: item.media }}
            style={styles.fullVideo}
            useNativeControls
            resizeMode="contain"
          />
          {item.texto && (
            <Text style={styles.fullText}>{item.texto}</Text>
          )}
        </View>
      );
    } else if (item.cancion) {
      return (
        <View style={styles.entryContent}>
          {/* Mostrar detalles de la canción */}
          <View style={styles.songContainer}>
            <Image
              source={{ uri: item.cancion.albumImage }}
              style={styles.songImage}
            />
            <View style={styles.songDetails}>
              <Text style={styles.songTitle}>{item.cancion.name}</Text>
              <Text style={styles.songArtist}>{item.cancion.artist}</Text>
            </View>
          </View>
          {item.texto && (
            <Text style={styles.fullText}>{item.texto}</Text>
          )}
          {(item.cancion.previewUrl || item.cancion.audioUri || item.audio) && (
            <AudioPlayer
              audioUri={
                item.cancion.previewUrl || item.cancion.audioUri || item.audio
              }
            />
          )}
        </View>
      );
    } else if (item.audio) {
      return (
        <View style={styles.entryContent}>
          <AudioPlayer audioUri={item.audio} />
          {item.texto && (
            <Text style={styles.fullText}>{item.texto}</Text>
          )}
        </View>
      );
    } else if (item.texto) {
      return <Text style={styles.fullText}>{item.texto}</Text>;
    } else {
      return (
        <Text style={styles.noContentText}>No hay contenido disponible</Text>
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Detalle de la Entrada</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Fecha de creación */}
      <Text style={styles.creationDate}>
        Creado el: {formattedCreationDate} a las {formattedCreationTime}
      </Text>

      {/* Contenido de la entrada */}
      <View style={styles.entryContentContainer}>{renderEntryContent()}</View>

      {/* Reflexiones */}
      <View style={styles.reflectionsContainer}>
        <View style={styles.reflectionsHeader}>
          <Text style={styles.reflectionsTitle}>
            Reflexiones ({reflexiones.length})
          </Text>
          <TouchableOpacity
            style={styles.addReflectionButton}
            onPress={() => setIsAddReflexionModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        {reflexiones.length > 0 ? (
          <TouchableOpacity
            style={styles.viewReflectionsButton}
            onPress={() => setIsReflexionModalVisible(true)}
          >
            <Text style={styles.viewReflectionsText}>Ver Reflexiones</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noReflectionsText}>No hay reflexiones aún.</Text>
        )}
      </View>

      {/* Fecha de Recuerdo */}
      <View style={styles.reminderDateContainer}>
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderTitle}>Fecha de Recuerdo</Text>
          <Switch
            value={enableRecuerdoDate}
            onValueChange={(value) => {
              setEnableRecuerdoDate(value);
              if (!value) {
                eliminarFechaRecuerdo();
              } else {
                setShowRecuerdoDatePicker(true);
              }
            }}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={enableRecuerdoDate ? "#f5dd4b" : "#f4f3f4"}
          />
        </View>
        {enableRecuerdoDate && recuerdoDate && (
          <View style={styles.reminderDateDisplay}>
            <Text style={styles.reminderDateText}>
              {recuerdoDate.toLocaleDateString("es-ES")}
            </Text>
            <TouchableOpacity onPress={() => setShowRecuerdoDatePicker(true)}>
              <Feather name="edit" size={18} color="#FFD700" />
            </TouchableOpacity>
          </View>
        )}
        {showRecuerdoDatePicker && (
          <DateTimePicker
            value={recuerdoDate || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeRecuerdoDate}
            maximumDate={new Date()}
            style={styles.dateTimePicker}
          />
        )}
      </View>

      {/* Beneficiario */}
      <View style={styles.beneficiaryContainer}>
        {beneficiary ? (
          <View style={styles.beneficiaryInfoContainer}>
            <Text style={styles.beneficiaryTitle}>Beneficiario Asignado:</Text>
            <View style={styles.beneficiaryDetails}>
              {beneficiary.profileImage ? (
                <Image
                  source={{ uri: beneficiary.profileImage }}
                  style={styles.beneficiaryImage}
                />
              ) : (
                <View style={styles.beneficiaryPlaceholder}>
                  <Text style={styles.beneficiaryPlaceholderText}>
                    {beneficiary.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.beneficiaryTextContainer}>
                <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                <Text style={styles.beneficiaryEmail}>{beneficiary.email}</Text>
              </View>
            </View>
            <View style={styles.beneficiaryButtonContainer}>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setAddBeneficiary(true)}
              >
                <Text style={styles.buttonText}>Cambiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveBeneficiary}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <Text style={styles.optionText}>¿Agregar Beneficiario?</Text>
              <Switch
                value={addBeneficiary}
                onValueChange={(value) => setAddBeneficiary(value)}
                thumbColor={addBeneficiary ? "#FFD700" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
              />
            </View>
            {addBeneficiary && (
              <View style={styles.beneficiaryPickerContainer}>
                <Picker
                  selectedValue={selectedBeneficiary}
                  onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#FFD700"
                >
                  <Picker.Item label="Selecciona un beneficiario" value="" />
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
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={handleAssignBeneficiary}
                >
                  <Text style={styles.buttonText}>Asignar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Modal para listar reflexiones */}
      <Modal
        visible={isReflexionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReflexionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Listado de Reflexiones</Text>
            <ScrollView>
              {reflexiones.map((reflexion) => (
                <View key={reflexion.id} style={styles.reflexionItem}>
                  <Text style={styles.reflexionTexto}>{reflexion.texto}</Text>
                  <Text style={styles.reflexionFecha}>
                    {reflexion.fecha
                      ? new Date(reflexion.fecha.seconds * 1000).toLocaleDateString(
                          "es-ES"
                        )
                      : "Fecha no disponible"}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsReflexionModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para agregar una reflexión */}
      <Modal
        visible={isAddReflexionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAddReflexionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Reflexión</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe tu reflexión aquí"
              placeholderTextColor="#ABB2B9"
              multiline
              numberOfLines={4}
              value={nuevaReflexion}
              onChangeText={setNuevaReflexion}
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAgregarReflexion}
            >
              <Text style={styles.buttonText}>Guardar Reflexión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsAddReflexionModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#F5F5F5",
    flexGrow: 1,
    alignItems: "center",
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "90%",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    backgroundColor: "#E74C3C",
    padding: 8,
    borderRadius: 50,
  },
  creationDate: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    textAlign: "center",
  },
  entryContentContainer: {
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  fullVideo: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  audioContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  fullText: {
    fontSize: 16,
    color: "#333",
    textAlign: "justify",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  noContentText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
  reflectionsContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reflectionsHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  reflectionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  addReflectionButton: {
    position: "absolute",
    right: 0,
    backgroundColor: "#3498DB",
    padding: 6,
    borderRadius: 50,
  },
  viewReflectionsButton: {
    marginTop: 10,
    backgroundColor: "#2980B9",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  viewReflectionsText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noReflectionsText: {
    color: "#888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  reminderDateContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  reminderDateDisplay: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  reminderDateText: {
    fontSize: 16,
    color: "#555",
    marginRight: 10,
  },
  dateTimePicker: {
    width: "100%",
    backgroundColor: "#fff",
  },
  beneficiaryContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  beneficiaryInfoContainer: {
    width: "100%",
    alignItems: "center",
  },
  beneficiaryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  beneficiaryDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  beneficiaryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  beneficiaryPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  beneficiaryPlaceholderText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  beneficiaryTextContainer: {
    alignItems: "center",
  },
  beneficiaryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  beneficiaryEmail: {
    fontSize: 14,
    color: "#888",
  },
  beneficiaryButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  changeButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#E74C3C",
    padding: 10,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  optionsContainer: {
    width: "100%",
    alignItems: "center",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  beneficiaryPickerContainer: {
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#333",
    backgroundColor: "#F0F2F5",
    borderRadius: 8,
    marginBottom: 10,
  },
  assignButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  reflexionItem: {
    backgroundColor: "#F0F2F5",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  reflexionTexto: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  reflexionFecha: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
  textInput: {
    height: 100,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    color: "#333",
    backgroundColor: "#F9F9F9",
    marginBottom: 15,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#2ECC71",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  closeModalButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  entryContentContainer: {
    marginBottom: 20,
    width: "90%",
    alignItems: "center",
  },
  entryContent: {
    width: "100%",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    backgroundColor: "#eaeaea", // Color de fondo mientras carga la imagen
  },
});

export default EntryItem;
