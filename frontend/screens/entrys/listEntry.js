import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Pressable, StyleSheet, Modal, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import PolaroidCard from './polaroidCard';
import { LinearGradient } from "expo-linear-gradient";
import SongCard from './songCard';
import TextCard from './textCard';
import { listenToEntries } from '../../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EntryItem from './entryItem'; // Modal de detalles de la entrada
import ProtectedAccess from './../../components/ProtectedAccess'; // Componente para la autenticación por niveles

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null); // Estado para la entrada seleccionada
  const [selectedLevel, setSelectedLevel] = useState('1'); // Nivel seleccionado (1, 2 o 3)
  const [showProtectedModal, setShowProtectedModal] = useState(false); // Controla el modal de protección
  const [accessGranted, setAccessGranted] = useState(false); // Controla si el acceso ha sido concedido para niveles 2 o 3

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);

        // Escuchar los cambios en la colección de entradas en tiempo real
        const unsubscribeEntries = listenToEntries((fetchedEntries) => {
          setEntries(fetchedEntries);
          setIsLoading(false);
        });

        return () => {
          unsubscribeEntries && unsubscribeEntries();
        };
      } else {
        setIsAuthenticated(false);
        setEntries([]);
        setIsLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const handleLevelChange = (level) => {
    if (level === '1') {
      setAccessGranted(true); // No requiere protección para el nivel 1
      setSelectedLevel(level);
    } else if (level === '2' || level === '3') {
      setAccessGranted(false); // Requiere autenticación para niveles 2 o 3
      setSelectedLevel(level);
      setShowProtectedModal(true); // Mostrar modal para niveles protegidos
    }
  };

  const closeModal = () => {
    setSelectedEntry(null); // Cerrar el modal de detalles
  };

  const onAccessGranted = () => {
    setAccessGranted(true); // Acceso concedido, permite ver las entradas del nivel 2 o 3
    setShowProtectedModal(false); // Cierra el modal de autenticación
  };

  const filteredEntries = entries.filter(entry => entry.nivel === selectedLevel); // Filtra las entradas según el nivel seleccionado

  if (!isAuthenticated) {
    return <Text style={styles.message}>Por favor, inicia sesión para ver tus entradas.</Text>;
  }

  return (
    <View style={styles.gradientContainer}>
      <LinearGradient
        colors={[
          "#2C3E50",
          "#4B4E6D",
          "#C2A66B",
          "#D1B17D",
          "#E6C47F",
          "#F0E4C2",
          "#F0E4C2",
          "#E6C47F",
          "#D1B17D",
          "#C2A66B",
          "#4B4E6D",
          "#2C3E50",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        {/* Selector de Nivel */}
        <View style={styles.levelSelector}>
          <Text style={styles.label}>Explorar Profundidad:</Text>
          <Picker
            selectedValue={selectedLevel}
            onValueChange={handleLevelChange}
            style={styles.picker}
          >
            <Picker.Item label="1. Reflexiones Cotidianas" value="1" />
            <Picker.Item label="2. Confesiones del Corazon" value="2" />
            <Picker.Item label="3. Esencia Profunda" value="3" />
          </Picker>
        </View>

        {/* Lista de Entradas */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B4E6D" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.container}>
            {accessGranted && filteredEntries.length === 0 ? (
              <Text style={styles.message}>No hay entradas disponibles para el nivel seleccionado</Text>
            ) : (
              filteredEntries.map(entry => {
                const EntryComponent = entry.mediaType === 'image' || entry.mediaType === 'video'
                  ? PolaroidCard
                  : entry.cancion ? SongCard : TextCard;

                return (
                  <Pressable key={entry.id} onPress={() => setSelectedEntry(entry)}>
                    <EntryComponent entry={entry} />
                  </Pressable>
                );
              })
            )}

            {/* Modal que muestra los detalles de la entrada */}
            {selectedEntry && (
              <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedEntry}
                onRequestClose={closeModal}
              >
                <EntryItem
                  item={selectedEntry}
                  onClose={closeModal} // Pasar la función para cerrar el modal
                />
              </Modal>
            )}

            {/* Modal de acceso protegido */}
            {showProtectedModal && (
              <Modal
                animationType="slide"
                transparent={true}
                visible={showProtectedModal}
                onRequestClose={() => setShowProtectedModal(false)}
              >
                <ProtectedAccess
                  nivel={selectedLevel}
                  onAccessGranted={onAccessGranted}
                  onClose={() => {
                    setShowProtectedModal(false); // Cerrar el modal y volver al nivel 1
                    setSelectedLevel('1'); // Volver al nivel 1 si se cierra el modal sin autenticación
                  }}
                />
              </Modal>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  container: {
    padding: 16,
    alignItems: 'center', // Centra todos los elementos dentro del ScrollView
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  levelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0E4C2',
    borderBottomWidth: 1,
    borderBottomColor: '#C2A66B',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ListEntry;
