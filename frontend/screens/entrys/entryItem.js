import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, Button, Alert, StyleSheet, Switch } from "react-native";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../utils/firebase";

const EntryItem = ({ item }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addToBaul, setAddToBaul] = useState(false); // Estado para "Sí" o "No" del switch
  const [nickname, setNickname] = useState('');

  // Manejar la acción de agregar al baúl
  const handleAddToBaul = async () => {
    if (!nickname) {
      Alert.alert('Error', 'Por favor, introduce un apodo para la entrada.');
      return;
    }

    try {
      // Actualizar el documento en Firestore para marcarlo como archivado
      const entryRef = doc(db, 'entries', item.id);
      await updateDoc(entryRef, { baul: true, nickname });

      Alert.alert('Éxito', 'La entrada ha sido agregada al Baúl.');
      // Restablecer los estados y cerrar el modal
      setModalVisible(false);
      setAddToBaul(false);
      setNickname('');
    } catch (error) {
      console.error('Error al agregar al Baúl: ', error);
      Alert.alert('Error', 'Ocurrió un error al agregar la entrada al Baúl.');
    }
  };

  return (
    <View style={styles.entryContainer}>
      {/* Entrada que al presionar abre el modal */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.entryMessage}>{item.message}</Text>
        <Text style={styles.entryDate}>{new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</Text>
      </TouchableOpacity>

      {/* Modal para mostrar detalles y opción de agregar al Baúl */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            {/* Hora de creación */}
            <Text style={styles.modalText}>
              Hora de creación: {new Date(item.createdAt.seconds * 1000).toLocaleTimeString()}
            </Text>

            {/* Categoría de la entrada */}
            {item.category && (
              <View style={styles.detailContainer}>
                <Text style={styles.modalTitle}>Detalles de la Entrada:</Text>
                <Text style={styles.detailText}>{item.category}</Text>
              </View>
            )}

            {/* Mensaje de la entrada */}
            <View style={styles.messageContainer}>
              <Text style={styles.modalTitle}>Mensaje:</Text>
              <Text style={styles.messageText}>{item.message}</Text>
            </View>

            {/* Switch para "Agregar al Baúl" */}
            <View style={styles.switchBaulContainer}>
              <Text style={styles.modalText}>¿Guardar en el baúl?</Text>
              <Switch
                value={addToBaul}
                onValueChange={setAddToBaul}
                thumbColor={addToBaul ? '#4CAF50' : '#f4f3f4'}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
              />
            </View>

            {/* Mostrar el campo de apodo solo si se selecciona "Sí" */}
            {addToBaul && (
              <View style={styles.nicknameContainer}>
                <TextInput
                  placeholder="Apodo para la entrada"
                  value={nickname}
                  onChangeText={setNickname}
                  style={styles.input}
                />
                <Button title="Agregar al Baúl" onPress={handleAddToBaul} />
              </View>
            )}

            {/* Botón para cancelar */}
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Estilos del componente
const styles = StyleSheet.create({
  entryContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  entryMessage: {
    fontSize: 16,
    color: '#333',
  },
  entryDate: {
    fontSize: 12,
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semitransparente
  },
  modalView: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Sombra en Android
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  detailContainer: {
    width: '100%',
    paddingVertical: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  switchBaulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
    width: '100%',
  },
  nicknameContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default EntryItem;
