import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';

const Temas = ({ setBackgroundImage }) => {
  // Lista de imágenes disponibles
  const images = [
    { id: 1, image: require('../../../assets/test/background.webp'), label: 'Tema 1' },
    { id: 2, image: require('../../../assets/test/fondo2.webp'), label: 'Tema 2' },
    { id: 3, image: require('../../../assets/test/playa.jpg'), label: 'Tema 3' },
  ];

  return (
    // Uso del fondo seleccionado como ImageBackground
    <ImageBackground source={require('../../../assets/test/background.webp')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Selecciona un Tema</Text>

        <View style={styles.optionsContainer}>
          {images.map((img) => (
            <TouchableOpacity
              key={img.id}
              style={styles.optionButton}
              onPress={() => {
                console.log("Setting background image to: ", img.image); // Debug: Verificar qué imagen se selecciona
                setBackgroundImage(img.image); // Actualiza la imagen de fondo
              }}>
              <Image source={img.image} style={styles.previewImage} />
              <Text style={styles.optionLabel}>{img.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ajustar imagen de fondo
  },
  container: {
    flex: 1,
    paddingTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para resaltar texto y opciones
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  optionButton: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  optionLabel: {
    color: 'white',
    marginTop: 5,
  },
});

export default Temas;
