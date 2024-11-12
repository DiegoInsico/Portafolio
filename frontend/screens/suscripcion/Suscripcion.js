// src/screens/Suscripcion.js

import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Linking, 
  StyleSheet,
  Image
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import axiosInstance from '../../utils/axiosInstance'; // Usando una instancia de axios configurada
import { Ionicons } from "@expo/vector-icons";

const Suscripcion = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      Alert.alert('Error', 'No estás autenticado.');
      return;
    }

    setLoading(true);
    try {
      // Llamar al backend para crear una sesión de pago
      const response = await axiosInstance.post('/payment/create-checkout-session', {
        userId: user.uid,
      });

      const { url } = response.data;

      if (!url) {
        throw new Error('URL de checkout no proporcionada.');
      }

      // Abrir la URL de Stripe Checkout
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el enlace de pago.');
      }

      // Opcional: Podrías navegar a una pantalla de espera o confirmar aquí
    } catch (error) {
      console.error('Error al crear la sesión de checkout:', error);
      if (error.response) {
        // El servidor respondió con un estado fuera del rango 2xx
        console.error('Datos de respuesta:', error.response.data);
        console.error('Estado de respuesta:', error.response.status);
        console.error('Encabezados de respuesta:', error.response.headers);
        Alert.alert('Error', error.response.data.message || 'No se pudo procesar la suscripción.');
      } else if (error.request) {
        // La solicitud fue hecha pero no hubo respuesta
        console.error('Solicitud realizada pero no hubo respuesta:', error.request);
        Alert.alert('Error', 'No se pudo contactar al servidor. Inténtalo de nuevo más tarde.');
      } else {
        // Algo pasó al configurar la solicitud
        console.error('Error al configurar la solicitud:', error.message);
        Alert.alert('Error', 'Ocurrió un error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../../assets/icon.png')} // Asegúrate de tener esta imagen en tu carpeta de assets
          style={styles.icon}
        />
        <Text style={styles.title}>Suscríbete a Premium</Text>
        <Text style={styles.description}>
          Obtén acceso a funcionalidades exclusivas como Programar Mensajes, soporte prioritario y más.
        </Text>
        
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cash-outline" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>Suscribirse por $9.99</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50', // Color de fondo sólido
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#34495E', // Color de tarjeta sólido
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 15,
    tintColor: '#FFD700', // Tinte dorado para el icono
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#ECF0F1',
    textAlign: 'center',
    marginBottom: 25,
  },
  subscribeButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonText: {
    color: '#2C3E50',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Suscripcion;
