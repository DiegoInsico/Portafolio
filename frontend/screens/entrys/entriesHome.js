import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry';
import ModalEntry from '../entrys/modalEntry';
import Navbar from '../../components/Header'; 
import Background from '../../components/background';
import { db, auth } from '../../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { FontAwesome } from "@expo/vector-icons"; // Importar íconos

export default function EntriesHome({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [entries, setEntries] = useState([]);

  const handlePress = () => {
    setModalVisible(true); // Abrir el modal
  };

  const handleCloseModal = () => {
    setModalVisible(false); // Cerrar el modal
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
        
        <View style={styles.entryListContainer}>
          <EntryListScreen entries={entries} />
        </View>
        <ModalEntry visible={modalVisible} onClose={handleCloseModal} />
      </View>
      <Navbar onAddPress={handlePress} /> 
    </Background>
  );
}

EntriesHome.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  dailyContainer: {
    flex: 1,
    paddingTop: 60, // Aumentar el paddingTop para dejar espacio para el botón
    alignItems: 'center',
    paddingBottom: 90,
    position: 'relative', // Necesario para posicionar el botón absoluto dentro
  },
  entryListContainer: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  goldenButton: {
    position: 'absolute',
    top: 10, // Ajusta según necesites
    alignSelf: 'center',
    backgroundColor: '#D4AF37', // Color dorado
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5, // Sombra para dar efecto de profundidad (Android)
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  goldenButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10, // Espacio entre el ícono y el texto
    fontWeight: 'bold',
  },
  // ... otros estilos existentes
});

