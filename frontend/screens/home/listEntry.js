// src/screens/listEntry.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ResponsiveGrid } from 'react-native-flexible-grid';

// Obtener el ancho de la ventana para ajustes responsivos
const windowWidth = Dimensions.get('window').width;

// Función para generar un ratio de altura aleatorio
const getRandomHeightRatio = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Función para calcular el ratio basado en la longitud del texto
const getTextHeightRatio = (text) => {
  const length = text.length;
  if (length <= 40) return 0.6; // Texto corto, ratio bajo
  if (length <= 70) return 0.8; // Texto mediano, ratio estándar
  if (length <= 150) return 1.5; // Texto más largo, ratio más alto
  return 2; // Texto muy largo, ratio mayor
};

export default function EntryListScreen({ entries }) {
  const [data, setData] = useState([]);

  // Generar los datos con imágenes, videos o solo texto
  const generateData = () => {
    return entries.map((entry) => ({
      id: entry.id,
      media: entry.mediaURL || entry.media, // Prioridad a mediaURL de Firestore
      isVideo: entry.mediaURL && (entry.mediaURL.endsWith('.mp4') || entry.mediaURL.endsWith('.mov')),
      text: entry.message || entry.text || '', // Mostrar texto si está disponible
      date: entry.date ? entry.date.toDate().toLocaleDateString() : '', // Formatear la fecha
      heightRatio: entry.mediaURL || entry.media
        ? getRandomHeightRatio(1.3, 2) // Si hay media, un ratio fijo
        : getTextHeightRatio(entry.message || entry.text || ''), // Si es solo texto, calcular el ratio basado en el texto
    }));
  };

  const renderItem = ({ item }) => {
    return (
      <View
        style={[styles.boxContainer, { height: (item.heightRatio ?? 1) * 150 }]} // Ajustar la altura según el ratio
      >
        {/* Mostrar la fecha arriba sin fondo contenedor cuando hay media */}
        {item.media ? (
          <Text style={styles.dateTextTop}>{item.date}</Text>
        ) : (
          <Text style={styles.dateTextBottom}>{item.date}</Text>
        )}

        {item.isVideo ? (
          item.media && (
            <Video
              source={{ uri: item.media }}
              style={styles.box}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN} // Ajustamos el video al contenedor
              isLooping
            />
          )
        ) : item.media ? (
          <Image
            source={{ uri: item.media }}
            style={styles.box}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.textOnlyContainer}>
            <Text style={styles.textOnly}>{item.text}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        )}

        {/* Overlay del texto solo si hay media */}
        {item.text && item.media && (
          <View style={styles.overlayBottom}>
            <Text style={styles.overlayText}>{item.text}</Text>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    setData(generateData());
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
  boxContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff', // Fondo blanco para mejor contraste
  },
  box: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textOnlyContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#C19A6B', // Fondo para cuando es solo texto
    minHeight: 150,  // Altura mínima para casos con poco texto
    flexGrow: 1,     // Permite que el contenedor crezca con el texto
    flexShrink: 1,   // Permite que el contenedor se reduzca si es necesario
    width: '100%',   // Ocupar el ancho total del contenedor
  },
  textOnly: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  dateTextTop: {
    position: 'absolute',
    top: 10, // Coloca la fecha en la parte superior para imágenes o videos
    left: 10,
    fontSize: 12,
    color: '#fff', // Blanco para contraste
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fondo translúcido para mayor legibilidad
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 1, // Asegura que esté sobre el contenido
  },
  dateTextBottom: {
    position: 'absolute',
    bottom: 10, // Coloca la fecha en la parte inferior centrada para texto solo
    left: 0,
    right: 0,
    fontSize: 12,
    color: '#333', // Color más oscuro para mayor contraste en el fondo de texto
    textAlign: 'center',
    backgroundColor: 'transparent', // Sin fondo en este caso
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5, // Separar la fecha del resto del contenido
  },
});
