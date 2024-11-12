// PremiumMessage.js

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import PropTypes from 'prop-types';
import { commonStyles } from '../../styles/commonStyles'; // Asegúrate de ajustar la ruta según tu estructura

const PremiumMessage = ({ navigation }) => {
  return (
    <View style={commonStyles.container}>
      <Image 
        source={require('../../assets/icon.png')} // Asegúrate de tener esta imagen en tu carpeta de assets
        style={commonStyles.icon}
      />
      <Text style={commonStyles.message}>
        Esta funcionalidad es exclusiva para usuarios premium. ¡Actualiza tu cuenta para acceder!
      </Text>
      <TouchableOpacity
        style={commonStyles.button}
        onPress={() => navigation.navigate('Suscripcion')}
      >
        <Ionicons name="star" size={20} color="#FFD700" style={{ marginRight: 10 }} />
        <Text style={commonStyles.buttonText}>Ir a Suscripción</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={commonStyles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close-circle" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
        <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

PremiumMessage.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default PremiumMessage;
