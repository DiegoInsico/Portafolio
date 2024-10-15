import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../../../utils/firebase'; // Asegúrate de que la ruta de firebase sea correcta

const Seguridad = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [counter, setCounter] = useState(10); // Temporizador para la eliminación
  const [canDelete, setCanDelete] = useState(false); // Controla cuándo se puede eliminar la cuenta
  const [email, setEmail] = useState(''); // Correo a ingresar
  const [password, setPassword] = useState(''); // Contraseña a ingresar
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga

  const navigation = useNavigation();

  // Temporizador de 10 segundos para habilitar el botón de eliminar cuenta
  useEffect(() => {
    if (isModalVisible && counter > 0) {
      const timer = setInterval(() => {
        setCounter((prevCounter) => prevCounter - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isModalVisible, counter]);

  useEffect(() => {
    if (counter === 0) {
      setCanDelete(true);
    }
  }, [counter]);

  // Función para abrir la alerta
  const openModal = () => {
    setModalVisible(true);
    setCounter(10); // Reiniciamos el contador
    setCanDelete(false); // Eliminar deshabilitado hasta que el contador llegue a 0
  };

  // Función para reautenticar al usuario
  const reauthenticateUser = async () => {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(email, password);
    try {
      await reauthenticateWithCredential(user, credential);
      return true;
    } catch (error) {
      console.error("Error al reautenticar:", error);
      Alert.alert("Error", "Correo o contraseña incorrectos.");
      return false;
    }
  };

  // Función para eliminar la cuenta
  const handleDeleteAccount = async () => {
    setLoading(true);
    const reauthenticated = await reauthenticateUser();
    if (reauthenticated) {
      try {
        await deleteUser(auth.currentUser);
        Alert.alert('Cuenta eliminada', 'Tu cuenta ha sido eliminada correctamente.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } catch (error) {
        Alert.alert('Error', 'Hubo un error al eliminar la cuenta. Inténtalo de nuevo.');
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privacidad y Seguridad</Text>

      {/* Verificación en dos pasos */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Veri')}>
        <Text style={styles.buttonText}>Verificación en Dos Pasos</Text>
      </TouchableOpacity>

      {/* Bloqueo Automático */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('BloSes')}>
        <Text style={styles.buttonText}>Bloqueo Automático</Text>
      </TouchableOpacity>

      {/* Alerta de seguridad */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AlertSeg')}>
        <Text style={styles.buttonText}>Alertas de Seguridad</Text>
      </TouchableOpacity>

      {/* Eliminar cuenta */}
      <TouchableOpacity style={styles.button} onPress={openModal}>
        <Text style={styles.buttonText}>Eliminar Cuenta</Text>
      </TouchableOpacity>

      {/* Modal para confirmar la eliminación */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Advertencia</Text>
            <Text style={styles.modalText}>
              Al eliminar la cuenta, no podrás recuperar tus datos. Si deseas recuperar información, contacta a correofalso@gmail.com.
            </Text>
            <Text style={styles.modalText}>
              Para continuar introduce tu correo y contraseña
            </Text>
            <Text style={styles.modalText}>Confirmando en {counter} segundos.</Text>

            {/* Input de correo */}
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Input de contraseña */}
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.buttonContainer}>
              {/* Botón de cancelar */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              {/* Botón de eliminar (habilitado solo cuando el temporizador llega a 0) */}
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: canDelete ? 'red' : 'grey' }]}
                onPress={handleDeleteAccount}
                disabled={!canDelete || loading}
              >
                <Text style={styles.deleteButtonText}>{loading ? 'Eliminando...' : 'Eliminar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3B873E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Seguridad;