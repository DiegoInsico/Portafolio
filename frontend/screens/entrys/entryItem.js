// src/components/EntryItem.js
import React from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import { Video, ResizeMode } from "expo-av";

const EntryItem = ({ item }) => {
  const isTextOnly = !item.media;

  return (
    <View
      style={[styles.boxContainer, { height: (item.heightRatio ?? 1) * 150 }]}
    >
      {/* **Entradas con Imagen/Vídeo: Mostrar Fecha en la Parte Superior Izquierda** */}
      {item.media && item.createdAt && (
        <Text style={styles.createdAtTextTopLeft}>{item.createdAt}</Text>
      )}

      {/* **Entradas de Solo Texto: Mostrar Texto en la Parte Superior y Fecha en la Inferior** */}
      {!item.media && (
        <View style={styles.textOnlyContainer}>
          <Text style={styles.textOnly}>{item.text}</Text>
          {item.createdAt && (
            <Text style={styles.createdAtText}>{`${item.createdAt}`}</Text>
          )}
        </View>
      )}

      {/* **Mostrar la Media (Imagen/Vídeo)** */}
      {item.media &&
        (item.isVideo ? (
          <Video
            source={{ uri: item.media }}
            style={[
              styles.box,
              item.widthRatio === 2
                ? styles.landscapeMedia
                : styles.portraitMedia,
            ]}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
          />
        ) : (
          <Image
            source={{ uri: item.media }}
            style={[
              styles.box,
              item.widthRatio === 2
                ? styles.landscapeMedia
                : styles.portraitMedia,
            ]}
            resizeMode="cover"
          />
        ))}

      {/* **Overlay del Texto Solo si Hay Media** */}
      {item.text && item.media && (
        <View style={styles.overlayBottom}>
          <Text style={styles.overlayText}>{item.text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  boxContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#black",
    backgroundColor: "#black", // Fondo blanco para mejor contraste
    position: "relative", // Para posicionar los textos absolutos
  },
  box: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  landscapeMedia: {
    width: "100%",
    height: "100%", // Altura fija para imágenes horizontales
  },
  portraitMedia: {
    width: "100%",
    height: "100%", // Altura mayor para imágenes verticales
  },
  textOnlyContainer: {
    flex: 1,
    flexDirection: "column", // Cambiar a columna para alinear verticalmente
    justifyContent: "space-evenly", // Distribuir espacio entre texto y fecha
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 5,
    backgroundColor: "#C19A6B", // Fondo para cuando es solo texto
    minHeight: 150, // Altura mínima para casos con poco texto
    flexGrow: 1, // Permite que el contenedor crezca con el texto
    flexShrink: 1, // Permite que el contenedor se reduzca si es necesario
    width: "100%", // Ocupar el ancho total del contenedor
  },
  textOnly: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  // **Estilo para la Fecha de Creación en Entradas con Media**
  createdAtTextTopLeft: {
    position: "absolute",
    top: 10, // Parte superior
    left: 10, // Izquierda
    fontSize: 12,
    color: "#fff", // Blanco para contraste
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semi-transparente para legibilidad
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
    zIndex: 1, // Asegura que esté sobre el contenido
  },
  createdAtText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 5,
    marginBottom: 20,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  overlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default EntryItem;
