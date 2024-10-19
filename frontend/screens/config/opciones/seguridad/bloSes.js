import React, { useContext } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { BloqueoContext } from '../../../../context/BloqueoContext'; // Asegúrate que el contexto está correctamente importado
import BackgroundWrapper from '../../../../components/background'; 
import { useNavigation } from '@react-navigation/native'; 
import { signOut } from 'firebase/auth'; 
import { auth } from '../../../../utils/firebase'; 

const BloSes = () => {
  const {
    bloqueoActivado,
    setBloqueoActivado,
    tiempoBloqueo,
    setTiempoBloqueo,
    iniciarTemporizador,
  } = useContext(BloqueoContext);

  const navigation = useNavigation();

  const toggleBloqueo = () => {
    setBloqueoActivado((prev) => !prev);

    if (!bloqueoActivado) {
      iniciarTemporizador(cerrarSesion); // Iniciar el temporizador cuando el bloqueo esté activado
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth); // Cerrar sesión en Firebase
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      console.log('Sesión cerrada por inactividad');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Configuración de Bloqueo Automático</Text>

        {/* Switch para activar o desactivar el bloqueo automático */}
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Activar Bloqueo Automático</Text>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={bloqueoActivado ? '#f5dd4b' : '#f4f3f4'}
            onValueChange={toggleBloqueo}
            value={bloqueoActivado}
          />
        </View>

        {/* Si el bloqueo está activado, mostrar las opciones de tiempo */}
        {bloqueoActivado && (
          <View>
            <Text style={styles.label}>Selecciona el tiempo de bloqueo:</Text>

            <Picker
              selectedValue={tiempoBloqueo}
              onValueChange={(itemValue) => setTiempoBloqueo(itemValue)}
              style={{
                width: 200,
                height: 50,
                color: '#fff',
                backgroundColor: '#333',
              }}
            >
              <Picker.Item label="15 segundos" value={15} />
              <Picker.Item label="30 segundos" value={30} />
              <Picker.Item label="1 minuto" value={60} />
              <Picker.Item label="5 minutos" value={5 * 60} />
            </Picker>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                iniciarTemporizador(cerrarSesion);
                console.log(`Temporizador de ${tiempoBloqueo} segundos configurado`);
              }}
            >
              <Text style={styles.buttonText}>Confirmar Tiempo de Bloqueo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#fff',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default BloSes;
