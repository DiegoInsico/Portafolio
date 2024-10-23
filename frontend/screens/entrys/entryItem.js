import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";

// Importar los componentes de tarjeta
import PolaroidCard from './polaroidCard';
import SongCard from './songCard';
import TextCard from './textCard';

// Importar Picker para el selector de beneficiarios
import { Picker } from '@react-native-picker/picker';

const EntryItem = ({ item, onClose, beneficiaries }) => {
  if (!item) {
    return null;
  }

  const [modalVisible, setModalVisible] = useState(true);
  const [addToBaul, setAddToBaul] = useState(false);
  const [nickname, setNickname] = useState("");

  const [addBeneficiary, setAddBeneficiary] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState("");

  // Convertir createdAt a una fecha legible
  const creationDateTime = item.createdAt
    ? new Date(item.createdAt.seconds * 1000)
    : null;

  const formattedCreationDate = creationDateTime
    ? creationDateTime.toLocaleDateString()
    : "Fecha no disponible";

  const formattedCreationTime = creationDateTime
    ? creationDateTime.toLocaleTimeString()
    : "Hora no disponible";

  // Manejar la acción de agregar al baúl
  const handleAddToBaul = async () => {
    try {
      // Actualizar el documento en Firestore para marcarlo como archivado
      const entryRef = doc(db, "entries", item.id);
      await updateDoc(entryRef, { baul: true, nickname });

      Alert.alert("Éxito", "La entrada ha sido agregada al Baúl.");
      // Restablecer los estados y cerrar el modal
      setModalVisible(false);
      setAddToBaul(false);
      setNickname("");
      onClose();
    } catch (error) {
      console.error("Error al agregar al Baúl: ", error);
      Alert.alert("Error", "Ocurrió un error al agregar la entrada al Baúl.");
    }
  };

  // Manejar la acción de asignar beneficiario
  const handleAssignBeneficiary = async () => {
    if (!selectedBeneficiary) {
      Alert.alert("Error", "Por favor, selecciona un beneficiario.");
      return;
    }

    try {
      // Actualizar el documento en Firestore para asociarlo con el beneficiario
      const entryRef = doc(db, "entries", item.id);
      await updateDoc(entryRef, { beneficiary: selectedBeneficiary });

      Alert.alert("Éxito", "Beneficiario asignado correctamente.");
      // Restablecer los estados
      setAddBeneficiary(false);
      setSelectedBeneficiary("");
    } catch (error) {
      console.error("Error al asignar beneficiario: ", error);
      Alert.alert("Error", "Ocurrió un error al asignar el beneficiario.");
    }
  };

  // Función para renderizar el componente de tarjeta apropiado
  const renderEntryContent = () => {
    if (item.media && (item.mediaType === 'image' || item.mediaType === 'video')) {
      return <PolaroidCard entry={item} />;
    } else if (item.cancion) {
      return <SongCard entry={item} />;
    } else if (item.texto || item.audio) {
      return <TextCard entry={item} />;
    } else {
      return <Text>No hay contenido disponible</Text>;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false} // Hacer que el modal ocupe toda la pantalla
      visible={modalVisible}
      onRequestClose={onClose}
    >
      <ScrollView contentContainerStyle={styles.modalContainer}>
        {/* Contenido de la entrada */}
        <View style={styles.entryContentContainer}>
          {renderEntryContent()}
        </View>

        {/* Opciones debajo del contenido */}
        <View style={styles.optionsContainer}>
          {/* Switch para "Agregar al Baúl" */}
          <View style={styles.optionItem}>
            <Text style={styles.modalText}>¿Guardar en el baúl?</Text>
            <Switch
              value={addToBaul}
              onValueChange={setAddToBaul}
              thumbColor={addToBaul ? "#4CAF50" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {/* Mostrar el campo de apodo y botón "Guardar" si se selecciona "Agregar al Baúl" */}
          {addToBaul && (
            <View style={styles.nicknameContainer}>
              <TextInput
                placeholder="Apodo para la entrada"
                value={nickname}
                onChangeText={setNickname}
                style={styles.input}
              />
              <Button title="Guardar en el Baúl" onPress={handleAddToBaul} />
            </View>
          )}

          {/* Pregunta para agregar beneficiario */}
          <View style={styles.optionItem}>
            <Text style={styles.modalText}>¿Agregar Beneficiario?</Text>
            <Switch
              value={addBeneficiary}
              onValueChange={setAddBeneficiary}
              thumbColor={addBeneficiary ? "#4CAF50" : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>

          {/* Mostrar el selector de beneficiarios si se selecciona "Sí" */}
          {addBeneficiary && (
            <View style={styles.beneficiaryContainer}>
              <Picker
                selectedValue={selectedBeneficiary}
                onValueChange={(itemValue) => setSelectedBeneficiary(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona un beneficiario" value="" />
                {beneficiaries.map((beneficiary) => (
                  <Picker.Item
                    key={beneficiary.id}
                    label={beneficiary.name}
                    value={beneficiary.id}
                  />
                ))}
              </Picker>
              <Button title="Asignar Beneficiario" onPress={handleAssignBeneficiary} />
            </View>
          )}

          {/* Botón para cerrar el modal */}
          <View style={styles.buttonContainer}>
            <Button title="Cerrar" onPress={onClose} color="red" />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

// Estilos del componente (puedes ajustarlos según tus preferencias)
const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  entryContentContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: 'space-between',
    width: '80%',
  },
  nicknameContainer: {
    marginBottom: 20,
    width: '80%',
  },
  beneficiaryContainer: {
    marginBottom: 20,
    width: '80%',
  },
  input: {
    width: "100%",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 20,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 10,
  },
});

export default EntryItem;
