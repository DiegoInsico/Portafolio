// src/screens/Home.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry'; // Asegúrate de que la ruta sea correcta
import Navbar from '../../components/Header';
import ModalEntry from '../entrys/modalEntry';
import Background from '../../components/background';
import { db, auth } from '../../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function Home({ navigation }) {
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
        // Redirigir al usuario a la pantalla de inicio de sesión si no está autenticado
        Alert.alert("No autenticado", "Por favor, inicia sesión para acceder a esta sección.");
        navigation.navigate('Login'); // Asegúrate de tener una pantalla de Login configurada
      } else {
        // Escuchar las entradas del usuario
        const q = query(
          collection(db, "entries"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const entriesData = [];
          querySnapshot.forEach((doc) => {
            entriesData.push({ id: doc.id, ...doc.data() });
          });
          setEntries(entriesData);
        }, (error) => {
          console.error("Error al obtener las entradas: ", error);
          Alert.alert("Error", "Ocurrió un error al obtener las entradas.");
        });

        // Limpia el listener al desmontar el componente
        return () => unsubscribe();
      }
    });

    // Limpia el listener de autenticación al desmontar el componente
    return () => unsubscribeAuth();
  }, []);

  return (
    <Background>
      <View style={styles.dailyContainer}>
        <View style={styles.entryListContainer}>
          <EntryListScreen entries={entries} />
        </View>
        {/* Botón para abrir el modal de entrada */}
        <Pressable style={styles.floatingButton} onPress={handlePress}>
          <FontAwesome name="plus" size={24} color="white" />
        </Pressable>
        {/* Modal para crear una nueva entrada */}
        <ModalEntry visible={modalVisible} onClose={handleCloseModal} />
        
      </View>
      <Navbar />
    </Background>
  );
}

Home.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  dailyContainer: {
    paddingTop: 40,
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  entryListContainer: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#3B873E',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});
