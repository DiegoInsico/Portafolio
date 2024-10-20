import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Modal, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry';
import ModalEntry from '../entrys/modalEntry';
import Background from '../../components/background';
import { db, auth } from '../../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { FontAwesome } from "@expo/vector-icons"; // Importar íconos

export default function EntriesHome({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null); // Nueva variable para la entrada seleccionada

  const handlePress = () => {
    setModalVisible(true); // Abrir el modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Cerrar el modal
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry); // Establecer la entrada seleccionada
    setModalVisible(true); // Mostrar el modal con los detalles
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        Alert.alert('No autenticado', 'Por favor, inicia sesión para acceder a esta sección.');
        navigation.navigate('Login');
      } else {
        const q = query(
          collection(db, 'entries'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const entriesData = [];
          querySnapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() });
          });
          setEntries(entriesData);
        }, (error) => {
          console.error('Error al obtener las entradas: ', error);
          Alert.alert('Error', 'Ocurrió un error al obtener las entradas.');
        });

        return () => unsubscribe();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <Background>
      <View style={styles.dailyContainer}>
        
        {/* Botón Dorado Centrado en la Parte Superior */}
        <TouchableOpacity style={styles.goldenButton} onPress={handlePress}>
          <FontAwesome name="plus" size={24} color="#fff" />
          <Text style={styles.goldenButtonText}>Añadir</Text>
        </TouchableOpacity>
        
        {/* Contenedor de la lista de entradas */}
        <View style={styles.entryListContainer}>
          <EntryListScreen entries={entries} onSelectEntry={handleSelectEntry} />
        </View>
        
        {/* Modal para mostrar los detalles de la entrada seleccionada */}
        {selectedEntry && (
          <Modal visible={modalVisible} animationType="slide" onRequestClose={handleCloseModal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Detalles de la Entrada</Text>
              
              {/* Cuadro de mensaje con scroll si tiene más de 200 caracteres */}
              <View style={styles.messageContainer}>
                <ScrollView style={styles.scrollView}>
                  <Text style={styles.messageText}>{selectedEntry.message}</Text>
                </ScrollView>
              </View>

              {selectedEntry.category && <Text>Categoría: {selectedEntry.category}</Text>}
              {selectedEntry.media && <Text>Media: {selectedEntry.media}</Text>}

              {/* Aquí puedes agregar la opción de agregar al baúl */}
              <TouchableOpacity onPress={handleCloseModal}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </View>
    </Background>
  );
}

EntriesHome.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  dailyContainer: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 0,
    alignItems: 'center',
    position: 'relative', 
  },
  entryListContainer: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 0,
    marginBottom: 80,
  },
  goldenButton: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  goldenButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  messageContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    maxHeight: 150, // Limitar la altura para que el scroll sea visible
    width: '100%',
  },
  scrollView: {
    maxHeight: 150, // Limita la altura para permitir el scroll si es necesario
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  modalClose: {
    marginTop: 20,
    color: 'blue',
  },
});
