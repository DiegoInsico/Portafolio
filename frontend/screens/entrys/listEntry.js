import React, { useEffect, useState } from 'react';
import { ScrollView, Text, ActivityIndicator, StyleSheet, Modal, View } from 'react-native';
import PolaroidCard from './polaroidCard';
import { LinearGradient } from "expo-linear-gradient";
import SongCard from './songCard';
import TextCard from './textCard';
import { listenToEntries } from '../../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EntryItem from './entryItem'; // Modal de detalles de la entrada

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null); // Estado para la entrada seleccionada

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);

        // Escuchar los cambios en la colección de entradas en tiempo real
        const unsubscribeEntries = listenToEntries((fetchedEntries) => {
          console.log('Entradas obtenidas:', fetchedEntries);
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

  const closeModal = () => {
    setSelectedEntry(null); // Cerrar el modal
  };

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
        <ScrollView contentContainerStyle={styles.container}>
          {entries.length === 0 ? (
            <Text style={styles.message}>No hay entradas disponibles</Text>
          ) : (
            entries
              .filter(entry => entry !== undefined)
              .map(entry => {
                // Condicional para mostrar el componente correcto según el contenido de la entrada
                if (entry.media && (entry.mediaType === 'image' || entry.mediaType === 'video')) {
                  return <PolaroidCard key={entry.id} entry={entry} onPress={() => setSelectedEntry(entry)} />;
                } else if (entry.cancion) {
                  return <SongCard key={entry.id} entry={entry} onPress={() => setSelectedEntry(entry)} />;
                } else if (entry.texto || entry.audio) {
                  return <TextCard key={entry.id} entry={entry} onPress={() => setSelectedEntry(entry)} />;
                } else {
                  return null;
                }
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
                onClose={closeModal}  // Pasar la función para cerrar el modal
              />
            </Modal>
          )}
        </ScrollView>
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
    alignItems: 'center',  // Centra todos los elementos dentro del ScrollView
  },
  message: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ListEntry;
