// src/screens/listEntry.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ResponsiveGrid } from 'react-native-flexible-grid';
import EntryItem from '../entrys/entryItem'; // Asegúrate de ajustar la ruta



// Función para generar un ratio de altura aleatorio
const getRandomHeightRatio = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Función para calcular el ratio basado en la longitud del texto
const getTextHeightRatio = (text) => {
  const length = text.length;
  
  if (length <= 40) return 0.6; // Texto corto, ratio bajo
  if (length <= 70) return 0.8; // Texto mediano, ratio estándar
  if (length <= 150) return 1; // Texto más largo, ratio más alto
  return 2; // Texto muy largo, ratio mayor
};

export default function EntryListScreen({ entries }) {
  const [data, setData] = useState([]);

  // Generar los datos con imágenes, videos o solo texto
  const generateData = () => {
    // Ordenar las entradas por 'createdAt' descendente
    const sortedEntries = [...entries].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate() - a.createdAt.toDate();
      }
      return 0;
    });

    return sortedEntries.map((entry) => ({
      id: entry.id,
      media: entry.mediaURL || entry.media, // Prioridad a mediaURL de Firestore
      isVideo: entry.mediaURL && (entry.mediaURL.endsWith('.mp4') || entry.mediaURL.endsWith('.mov')),
      text: entry.message || entry.text || '', // Mostrar texto si está disponible
      createdAt: entry.createdAt ? entry.createdAt.toDate().toLocaleDateString() : '', // Formatear la fecha de creación
      // Eliminamos date y recuerdoDate ya que no los necesitamos
      heightRatio: entry.mediaURL || entry.media
        ? getRandomHeightRatio(1.3, 2) // Si hay media, un ratio fijo
        : getTextHeightRatio(entry.message || entry.text || ''), // Si es solo texto, calcular el ratio basado en el texto
    }));
  };

  const renderItem = ({ item }) => {
    return <EntryItem item={item} />;
  };

  useEffect(() => {
    const generatedData = generateData();
    console.log('Datos generados para la lista:', generatedData);
    setData(generatedData);
  }, [entries]);

  return (
    <View style={{ flex: 1 }}>
      <ResponsiveGrid
        keyExtractor={(item) => item.id.toString()}
        maxItemsPerColumn={2}
        data={data}
        renderItem={renderItem}
        style={{ padding: 0 }}
        virtualization={true}  // Habilitar virtualización para un mejor rendimiento
        showScrollIndicator={true}  // Mostrar el indicador de desplazamiento si es necesario
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Aquí puedes mantener o eliminar estilos que ya no se usan
});
