import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './../../components/styles';

const Profile = ({ navigation }) => {
  return (
    <View style={styles.containerF}>
      <Text style={styles.title}>Perfil del Usuario</Text>
      <Text style={styles.subtitle}>Nombre: Usuario Ejemplo</Text>
      <Text style={styles.subtitle}>Email: usuario@ejemplo.com</Text>

      <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('Configuracion')}>
        <Text style={styles.buttonTextF}>Configuración</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('AdminTest')}>
        <Text style={styles.buttonTextF}>Administrar Testigos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('AdminBene')}>
        <Text style={styles.buttonTextF}>Administrar Beneficiarios</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonF} onPress={() => navigation.navigate('Seguridad')}>
        <Text style={styles.buttonTextF}>Seguridad y Privacidad</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
