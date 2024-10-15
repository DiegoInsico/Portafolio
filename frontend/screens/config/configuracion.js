// Configuraciones.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import BackgroundWrapper from '../../components/background'; // Importamos el fondo con gradiente
import styles from './../../components/styles'; // Importamos los estilos

const Configuraciones = ({ navigation }) => {
  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración</Text>

        {/* Botones estilizados desde styles.js */}
        <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('AdminCuenta')}>
          <Text style={styles.buttonTextF}>Administrar Cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('Seguridad')}>
          <Text style={styles.buttonTextF}>Seguridad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('Acces')}>
          <Text style={styles.buttonTextF}>Accesibilidad</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('Ajustes')}>
          <Text style={styles.buttonTextF}>Otros Ajustes</Text>
        </TouchableOpacity>
      </View>
    </BackgroundWrapper>
  );
};

export default Configuraciones;
