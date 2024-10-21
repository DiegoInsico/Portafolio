// NotificationPreferences.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";

const NotificationPreferences = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const auth = getAuth();
  
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      const userId = auth.currentUser.uid;
      const userDoc = doc(db, "users", userId); // Asegúrate de que la colección "users" tenga los ajustes
      const userSnapshot = await getDoc(userDoc);
      
      if (userSnapshot.exists()) {
        setNotificationsEnabled(userSnapshot.data().notificationsEnabled);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleToggleSwitch = async () => {
    const userId = auth.currentUser.uid;
    const userDoc = doc(db, "users", userId);

    try {
      await updateDoc(userDoc, { notificationsEnabled: !notificationsEnabled });
      setNotificationsEnabled((prev) => !prev);
      Alert.alert("Éxito", "Tus preferencias de notificación han sido actualizadas.");
    } catch (error) {
      console.error("Error al actualizar preferencias: ", error);
      Alert.alert("Error", "Ocurrió un problema al actualizar tus preferencias.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Preferencias de Notificación</Text>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Recibir Notificaciones:</Text>
        <Switch
          onValueChange={handleToggleSwitch}
          value={notificationsEnabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={notificationsEnabled ? '#FFD700' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#2C3E50',
    borderRadius: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
  },
});

export default NotificationPreferences;
