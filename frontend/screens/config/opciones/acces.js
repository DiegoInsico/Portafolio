import React, { useState } from 'react';
import { View, Text, Switch, Alert, StyleSheet } from 'react-native';
import Background from '../../../components/background'; // Asegúrate de tener correctamente importado el componente de fondo.

const Accesibilidad = () => {
  const [largeText, setLargeText] = useState(false);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [vibrationFeedback, setVibrationFeedback] = useState(false);

  // Funciones que muestran "en camino"
  const handleLargeTextToggle = () => {
    setLargeText(!largeText);
    Alert.alert('Función', 'Aumento de tamaño de letra en camino.');
  };

  const handleColorBlindModeToggle = () => {
    setColorBlindMode(!colorBlindMode);
    Alert.alert('Función', 'Modo daltónico en camino.');
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
    Alert.alert('Función', 'Modo de alto contraste en camino.');
  };

  const handleReduceMotionToggle = () => {
    setReduceMotion(!reduceMotion);
    Alert.alert('Función', 'Reducción de movimiento en camino.');
  };

  const handleVibrationFeedbackToggle = () => {
    setVibrationFeedback(!vibrationFeedback);
    Alert.alert('Función', 'Retroalimentación háptica en camino.');
  };

  return (
    <Background>
      <View style={styles.container}>
        <Text style={styles.title}>Accesibilidad</Text>

        {/* Cuadro con opacidad para las opciones */}
        <View style={styles.optionCard}>
          {/* Botón para activar/desactivar texto grande */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Aumentar tamaño de letra</Text>
            <Switch
              value={largeText}
              onValueChange={handleLargeTextToggle}
            />
          </View>

          {/* Botón para activar/desactivar modo daltónico */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Modo daltónico</Text>
            <Switch
              value={colorBlindMode}
              onValueChange={handleColorBlindModeToggle}
            />
          </View>

          {/* Botón para activar/desactivar alto contraste */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Modo alto contraste</Text>
            <Switch
              value={highContrast}
              onValueChange={handleHighContrastToggle}
            />
          </View>

          {/* Botón para activar/desactivar reducción de movimiento */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Reducir movimiento</Text>
            <Switch
              value={reduceMotion}
              onValueChange={handleReduceMotionToggle}
            />
          </View>

          {/* Botón para activar/desactivar retroalimentación háptica */}
          <View style={styles.optionContainer}>
            <Text style={styles.optionLabel}>Retroalimentación háptica</Text>
            <Switch
              value={vibrationFeedback}
              onValueChange={handleVibrationFeedbackToggle}
            />
          </View>
        </View>
      </View>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Aumentamos el padding para mover las opciones hacia arriba
    paddingHorizontal: 20,
    justifyContent: 'flex-start', // Mover hacia arriba
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: 'white',
  },
  optionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Cuadro con opacidad del 80%
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 18,
    color: 'white',
  },
});

export default Accesibilidad;
