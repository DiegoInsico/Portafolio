import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

const BackgroundWrapper = ({ children }) => {
  return (
    <View style={styles.background}>
      <ImageBackground
        source={require("../assets/test/background.webp")} // Ruta a tu imagen de fondo
        style={styles.backgroundImage}
      >
        {/* Capa oscura superpuesta */}
        <View style={styles.overlayDarken} />

        {/* Contenido */}
        <View style={styles.content}>
          {children}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    flex: 0,
    resizeMode: 'cover', // Ajustar la imagen de fondo para cubrir toda la pantalla
    width: '100%',
    height: '100%',
  },
  overlayDarken: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Capa oscura con opacidad
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Ajusta según sea necesario
    justifyContent: 'center',
  },
});

export default BackgroundWrapper;
