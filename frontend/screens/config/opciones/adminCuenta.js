import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BackgroundWrapper from './../../../components/background'; // Asegúrate de importar correctamente el fondo.

const AdminCuenta = () => {
  // Simulación de datos del usuario
  const esPremium = true;  // Cambiar valor para probar free o premium
  const tarjetaRegistrada = '**** **** **** 4545';
  const ultimaFechaPago = '10 de Octubre 2024';

  // Beneficios para usuarios Premium
  const beneficiosPremium = [
    'Más espacio de almacenamiento',
    'Acceso a funciones exclusivas',
    'Agregar más testigos',
    'Atención al cliente prioritaria',
    'Has guardado 3gb de información. Sigue así'
  ];

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Administrar Cuenta</Text>

        {/* Mostrar si el usuario es Free o Premium */}
        <View style={styles.card}>
          <Text style={styles.cardText}>
            Estado de la cuenta: {esPremium ? 'Usuario Premium' : 'Usuario Free'}
          </Text>

          {/* Mostrar beneficios si es Premium */}
          {esPremium && (
            <View>
              <Text style={styles.optionDescription}>Beneficios de ser Premium:</Text>
              {beneficiosPremium.map((beneficio, index) => (
                <Text key={index} style={styles.benefitText}>
                  - {beneficio}
                </Text>
              ))}
            </View>
          )}

          {/* Mostrar una opción para mejorar la cuenta si es Free */}
          {!esPremium && (
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Mejorar a Premium</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mostrar detalles de la tarjeta registrada */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.optionDescription}>Tarjeta Registrada:</Text>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>{tarjetaRegistrada}</Text>
          </View>

          {/* Mostrar la última fecha de pago si es Premium */}
          {esPremium && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.optionDescription}>Última fecha de pago:</Text>
              <Text style={styles.cardText}>{ultimaFechaPago}</Text>
            </View>
          )}
        </View>
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start', // Ajusta para dejar las cartas arriba
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Para Android
  },
  cardText: {
    fontSize: 16,
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#777',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminCuenta;
