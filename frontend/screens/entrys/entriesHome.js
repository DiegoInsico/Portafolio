import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry';
import ModalEntry from '../entrys/modalEntry';
import Navbar from '../../components/Header'; 
import Background from '../../components/background';
import { db, auth } from '../../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

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
    paddingTop: 40,
    alignItems: 'center',
    paddingBottom: 90,
  },
  entryListContainer: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 0,
  },
});
