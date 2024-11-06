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
} from "react-native";
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import PolaroidCard from "./polaroidCard";
import SongCard from "./songCard";
import TextCard from "./textCard";
import { Picker } from "@react-native-picker/picker";

const EntryItem = ({ item, onClose, beneficiaries }) => {
  const [addBeneficiary, setAddBeneficiary] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");
  const [beneficiary, setBeneficiary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <ScrollView contentContainerStyle={styles.modalContainer}>
      <View style={styles.entryContentContainer}>
        {renderEntryContent()}
        <Text style={styles.dateText}>
          Creado el: {formattedCreationDate} a las {formattedCreationTime}
        </Text>
      </View>

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
              <Text style={styles.buttonText}>Cambiar Beneficiario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveBeneficiary}>
              <Text style={styles.buttonText}>Eliminar Beneficiario</Text>
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
                <Text style={styles.buttonText}>Asignar Beneficiario</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.buttonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: "#1C2833",
    paddingBottom: 40,
  },
  entryContentContainer: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  dateText: {
    marginTop: 10,
    fontSize: 12,
    color: "#F1C40F",
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#F1C40F",
  },
  beneficiaryContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  beneficiaryInfoContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
    backgroundColor: "#2C3E50",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1C40F",
  },
  beneficiaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#F1C40F",
    textAlign: "center",
  },
  beneficiaryDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  beneficiaryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#F1C40F",
  },
  beneficiaryPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F1C40F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  beneficiaryPlaceholderText: {
    color: "#1C2833",
    fontSize: 24,
    fontWeight: "bold",
  },
  beneficiaryTextContainer: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F1C40F",
  },
  beneficiaryEmail: {
    fontSize: 14,
    color: "#ABB2B9",
  },
  beneficiaryButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  changeButton: {
    backgroundColor: "#F1C40F",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  removeButton: {
    backgroundColor: "#E74C3C",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  assignButton: {
    backgroundColor: "#F1C40F",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#1C2833",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonContainer: {
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  noContentText: {
    color: "#F1C40F",
    fontSize: 16,
    textAlign: "center",
  },
  picker: {
    width: "100%",
    height: 50,
    color: "#F1C40F",
    backgroundColor: "#2C3E50",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});

export default EntryItem;
