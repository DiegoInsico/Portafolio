import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BackgroundWrapper = ({ children }) => {
  return (
    <LinearGradient
      colors={[
        "#D4AF37", // Dorado suave
        "#E6C47F", // Melocotón suave/dorado claro
        "#C2A66B", // Dorado oscuro más neutro
        "#4B4E6D", // Azul grisáceo oscuro para las sombras
        "#2C3E50", // Negro grisáceo oscuro en la parte inferior
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    padding: 0,
  },
});

export default BackgroundWrapper;
