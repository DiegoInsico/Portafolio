// src/screens/Home.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry'; // Asegúrate de que la ruta sea correcta
import Navbar from '../../components/Header';
import SideBar from '../../components/sideBar'; // Asegúrate de que la ruta sea correcta
import Background from '../../components/background'; // Asegúrate de que la ruta sea correcta
import { db, auth } from '../../utils/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function Home({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [sideBarVisible, setSideBarVisible] = useState(false); // Estado para mostrar el Sidebar

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
  }, [navigation]);

  // Función para manejar la visibilidad del Sidebar
  const handleSideBarToggle = () => {
    setSideBarVisible(!sideBarVisible);
  };

  return (
    <Background>
      {/* Lista de entradas */}
      <View style={styles.dailyContainer}>
        <View style={styles.entryListContainer}>
          <EntryListScreen entries={entries} />
        </View>
      </View>

      {/* Navbar: Pasamos la función para controlar el sidebar */}
      <Navbar navigation={navigation} onToggleSideBar={handleSideBarToggle} />

      {/* Sidebar */}
      {sideBarVisible && (
        <SideBar visible={sideBarVisible} onClose={handleSideBarToggle} navigation={navigation} />
      )}
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
});