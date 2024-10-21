import React, { useEffect, useState } from 'react';
import { ScrollView, Text, Modal, View, StyleSheet } from 'react-native';
import PolaroidCard from './entryPolaroid';
import { getEntries } from '../../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import EntryItem from './entryItem'; // Modal de detalles de la entrada
import { LinearGradient } from 'expo-linear-gradient'; // Importa el gradiente

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
      <ScrollView>
        {entries.length === 0 ? (
          <Text style={{ textAlign: 'center' }}>No hay entradas disponibles</Text>
        ) : (
          entries
            .filter(entry => entry !== undefined) // Filtrar entradas que no sean undefined
            .map(entry => (
              <PolaroidCard 
                key={entry.id} 
                entry={entry} 
                onPress={() => setSelectedEntry(entry)} // Seleccionar entrada para mostrar modal
              />
            ))
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
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

export default ListEntry;
