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
import DateTimePicker from '@react-native-community/datetimepicker';
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
import PolaroidCard from "./polaroidCard";
import SongCard from "./songCard";
import TextCard from "./textCard";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons, Feather } from "@expo/vector-icons";

const EntryItem = ({ item, onClose, beneficiaries }) => {
  const [addBeneficiary, setAddBeneficiary] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [beneficiary, setBeneficiary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para reflexiones
  const [reflexiones, setReflexiones] = useState([]);
  const [isReflexionModalVisible, setIsReflexionModalVisible] = useState(false);
  const [isAddReflexionModalVisible, setIsAddReflexionModalVisible] = useState(false);
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
        fechaRecuerdo: date, // Firestore acepta objetos Date
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

  const renderEntryContent = () => {
    if (item.media && (item.mediaType === "image" || item.mediaType === "video")) {
      return <PolaroidCard entry={item} />;
    } else if (item.cancion) {
      return <SongCard entry={item} />;
    } else if (item.texto || item.audio) {
      return <TextCard entry={item} />;
    } else {
      return <Text style={styles.noContentText}>No hay contenido disponible</Text>;
    }
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
        // usuarioId: currentUser.uid, // Si usas autenticación y deseas asociar la reflexión a un usuario
      });
      Alert.alert("Éxito", "Reflexión agregada correctamente.");
      setNuevaReflexion("");
      setIsAddReflexionModalVisible(false);
    } catch (error) {
      console.error("Error al agregar reflexión:", error);
      Alert.alert("Error", "Ocurrió un error al agregar la reflexión.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Sección de Fecha de Creación */}
      <View style={styles.fechaCreacionContainer}>
        <Text style={styles.fechaCreacionText}>
          Creado el: {formattedCreationDate} a las {formattedCreationTime}
        </Text>
      </View>

      {/* Contenido de la Entrada */}
      <View style={styles.entryContentContainer}>
        {renderEntryContent()}
      </View>

      {/* Reflexiones */}
      <View style={styles.reflexionesContainer}>
        <View style={styles.reflexionesHeader}>
          <Text style={styles.reflexionesTitle}>Reflexiones ({reflexiones.length})</Text>
          <TouchableOpacity 
            style={styles.agregarReflexionButton} 
            onPress={() => setIsAddReflexionModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        {reflexiones.length > 0 ? (
          <TouchableOpacity style={styles.verReflexionesButton} onPress={() => setIsReflexionModalVisible(true)}>
            <Text style={styles.buttonText}>Ver Reflexiones</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noReflexionesText}>No hay reflexiones aún.</Text>
        )}
      </View>

      {/* Sección de Fecha de Recuerdo */}
      <View style={styles.fechaRecuerdoContainer}>
        <View style={styles.fechaRecuerdoHeader}>
          <Feather name="calendar" size={20} color="#FFD700" />
          <Text style={styles.fechaRecuerdoLabel}>Fecha de Recuerdo</Text>
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
            trackColor={{ false: "#767577", true: "#FFD700" }}
            thumbColor={enableRecuerdoDate ? "#FFD700" : "#f4f3f4"}
          />
        </View>

        {enableRecuerdoDate && recuerdoDate && (
          <View style={styles.recuerdoDateDisplay}>
            <Text style={styles.recuerdoDateText}>
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
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeRecuerdoDate}
            maximumDate={new Date()}
            style={styles.dateTimePicker}
          />
        )}
      </View>

      {/* Beneficiarios */}
      <View style={styles.beneficiariosContainer}>
        {beneficiary ? (
          <View style={styles.beneficiaryInfoContainer}>
            <Text style={styles.beneficiaryTitle}>Beneficiario Asignado:</Text>
            <View style={styles.beneficiaryDetails}>
              {beneficiary.profileImage ? (
                <Image source={{ uri: beneficiary.profileImage }} style={styles.beneficiaryImage} />
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
              <TouchableOpacity style={styles.changeButton} onPress={() => setAddBeneficiary(true)}>
                <Text style={styles.buttonText}>Cambiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveBeneficiary}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <Text style={styles.modalText}>¿Agregar Beneficiario?</Text>
              <Switch
                value={addBeneficiary}
                onValueChange={(value) => setAddBeneficiary(value)}
                thumbColor={addBeneficiary ? "#FFD700" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "#FFD700" }}
              />
            </View>

            {addBeneficiary && (
              <View style={styles.beneficiaryContainer}>
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
                    <Picker.Item label="No hay beneficiarios disponibles" value="" />
                  )}
                </Picker>
                <TouchableOpacity style={styles.assignButton} onPress={handleAssignBeneficiary}>
                  <Text style={styles.buttonText}>Asignar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Botón de Cerrar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Cerrar</Text>
        </TouchableOpacity>
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
                    {new Date(reflexion.fecha.seconds * 1000).toLocaleDateString("es-ES")}
                  </Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsReflexionModalVisible(false)}>
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
            <ScrollView>
              <TextInput
                style={styles.textInput}
                placeholder="Escribe tu reflexión aquí"
                placeholderTextColor="#ABB2B9"
                multiline
                numberOfLines={4}
                value={nuevaReflexion}
                onChangeText={setNuevaReflexion}
              />
            </ScrollView>
            <TouchableOpacity style={styles.saveButton} onPress={handleAgregarReflexion}>
              <Text style={styles.buttonText}>Guardar Reflexión</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsAddReflexionModalVisible(false)}>
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
    padding: 20,
    backgroundColor: "#1C2833",
    paddingBottom: 40,
  },
  /* Sección de Fecha de Creación */
  fechaCreacionContainer: {
    marginBottom: 20,
    width: "100%",
    padding: 10,
    backgroundColor: "#2C3E50",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  fechaCreacionText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
  },

  /* Contenido de la Entrada */
  entryContentContainer: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2C3E50",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  dateText: {
    marginTop: 10,
    fontSize: 12,
    color: "#FFD700",
    textAlign: "center",
  },

  /* Reflexiones */
  reflexionesContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  reflexionesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reflexionesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  agregarReflexionButton: {
    backgroundColor: "#3498DB",
    padding: 6,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verReflexionesButton: {
    backgroundColor: "#2980B9",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  noReflexionesText: {
    color: "#95A5A6",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },

  /* Sección de Fecha de Recuerdo */
  fechaRecuerdoContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#2C3E50",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  fechaRecuerdoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fechaRecuerdoLabel: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 5,
  },
  switchRecuerdoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recuerdoDateDisplay: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recuerdoDateText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "500",
  },
  cambiarFechaText: {
    color: "#FFD700",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  dateTimePicker: {
    width: "100%",
    backgroundColor: "#2C3E50",
  },

  /* Beneficiarios */
  beneficiariosContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  beneficiaryInfoContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#2C3E50",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  beneficiaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFD700",
    textAlign: "center",
  },
  beneficiaryDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  beneficiaryImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  beneficiaryPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  beneficiaryPlaceholderText: {
    color: "#2C3E50",
    fontSize: 20,
    fontWeight: "bold",
  },
  beneficiaryTextContainer: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  beneficiaryEmail: {
    fontSize: 12,
    color: "#ABB2B9",
  },
  beneficiaryButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  changeButton: {
    backgroundColor: "#FFD700",
    padding: 8,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#E74C3C",
    padding: 8,
    borderRadius: 5,
    width: "48%",
    alignItems: "center",
  },

  optionsContainer: {
    width: "100%",
    padding: 15,
    backgroundColor: "#2C3E50",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 5,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#FFD700",
  },
  picker: {
    width: "100%",
    height: 50,
    color: "#FFD700",
    backgroundColor: "#34495E",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  assignButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#2C3E50",
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%', // Limita la altura para permitir el scroll si es necesario
    width: '90%', // Ancho del modal
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 20,
  },
  reflexionItem: {
    backgroundColor: "#34495E",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reflexionTexto: {
    fontSize: 16,
    color: "#ECF0F1",
    marginBottom: 5,
  },
  reflexionFecha: {
    fontSize: 12,
    color: "#95A5A6",
    textAlign: "right",
  },
  textInput: {
    height: 80,
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: "#ECF0F1",
    backgroundColor: "#34495E",
    marginBottom: 20,
    textAlignVertical: 'top', // Para alinear el texto en la parte superior
  },
  saveButton: {
    backgroundColor: "#2ECC71",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  noContentText: {
    color: "#95A5A6",
    fontSize: 16,
    textAlign: "center",
  },
});

export default EntryItem;
