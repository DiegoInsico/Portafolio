import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { auth, db } from '../../utils/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const CrearMensaje = () => {
  const [motivo, setMotivo] = useState('');
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState('');
  const [messages, setMessages] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      fetchMessages(currentUser.uid);
      checkNotificationsEnabled(currentUser.uid);
    }
  }, []);

  const fetchMessages = async (userId) => {
    try {
      const q = query(collection(db, 'solicitudes'), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const userMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(userMessages);

      // Contar mensajes con respuesta o notificaciones de recordatorios
      const count = userMessages.filter(message => message.respuesta || message.tipoNotificacion === 'Recordatorio').length;
      setNotificationCount(count);
    } catch (error) {
      console.error("Error al obtener los mensajes:", error);
    }
  };

  const checkNotificationsEnabled = async (userId) => {
    const userDoc = doc(db, "users", userId);
    const userSnapshot = await getDocs(userDoc);
    if (userSnapshot.exists()) {
      setNotificationsEnabled(userSnapshot.data().notificationsEnabled || false);
    }
  };

  const toggleNotifications = async () => {
    setNotificationsEnabled(!notificationsEnabled);
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { notificationsEnabled: !notificationsEnabled });
  };

  const handleClearNotifications = () => {
    setNotificationCount(0);
    alert('Notificaciones limpiadas');
  };

  const handleSubmit = async () => {
    const messageId = `msg-${Date.now()}`;
    const date = new Date().toLocaleString();

    const messageData = {
      userId,
      messageId,
      motivo,
      description,
      date,
      respuesta: '', // Campo vacío para la respuesta del admin
    };

    try {
      await addDoc(collection(db, 'solicitudes'), messageData);
      alert('Mensaje creado y guardado con éxito');
      fetchMessages(userId);
      setMotivo('');
      setDescription('');
    } catch (error) {
      console.error("Error al guardar el mensaje:", error);
      alert('Hubo un error al guardar el mensaje');
    }
  };

  const renderMessage = ({ item }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>ID: {item.messageId}</Text>
      <Text style={styles.messageText}>Motivo: {item.motivo}</Text>
      <Text style={styles.messageText}>Mensaje: {item.description}</Text>
      <Text style={styles.responseText}>Respuesta: {item.respuesta || 'Pendiente'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear un Mensaje</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Motivo"
        value={motivo}
        onChangeText={setMotivo}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        maxLength={300}
        multiline
      />

      <Button title="Enviar" onPress={handleSubmit} />

      {/* Botón de Notificaciones */}
      <TouchableOpacity style={styles.notificationButton} onPress={toggleNotifications}>
        <FontAwesome
          name="bell"
          size={24}
          color={notificationsEnabled ? 'green' : 'gray'}
        />
        {notificationCount > 0 && (
          <View style={styles.notificationCount}>
            <Text style={styles.notificationText}>{notificationCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Button title="Limpiar Notificaciones" onPress={handleClearNotifications} />

      <Text style={styles.subTitle}>Mis Mensajes Enviados</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontSize: 16,
    borderRadius: 5,
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  messageContainer: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
  },
  responseText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
  },
  notificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationCount: {
    backgroundColor: 'red',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  notificationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CrearMensaje;
