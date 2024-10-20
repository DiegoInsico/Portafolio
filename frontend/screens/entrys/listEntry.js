import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import PolaroidCard from './entryPolaroid';
import { getEntries } from '../../utils/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setIsAuthenticated(true);
        fetchEntries();
      } else {
        setIsAuthenticated(false);
        setEntries([]);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchEntries = async () => {
    try {
      const fetchedEntries = await getEntries();
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  if (isLoading) {
    return <Text>Cargando...</Text>;
  }

  if (!isAuthenticated) {
    return <Text>Por favor, inicia sesión para ver tus entradas.</Text>;
  }

  return (
    <ScrollView>
      {entries.length === 0 ? (
        <Text style={{ textAlign: 'center' }}>No hay entradas disponibles</Text>
      ) : (
        entries
          .filter(entry => entry !== undefined) // Filtrar entradas que no sean undefined
          .map(entry => (
            <PolaroidCard key={entry.id} entry={entry} />
          ))
      )}
    </ScrollView>
  );
};

export default ListEntry;
