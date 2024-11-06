// SettingsScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const configureNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Las notificaciones no están habilitadas");
      }
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
    };

    configureNotifications();
  }, []);

  const toggleBiometricAuth = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert("Biometría no disponible", "Este dispositivo no admite autenticación biométrica");
      return;
    }

    setBiometricEnabled(!biometricEnabled);
    if (!biometricEnabled) {
      Alert.alert("Biometría habilitada", "La autenticación biométrica está habilitada.");
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Las notificaciones no están habilitadas");
        return;
      }
      await scheduleDailyReminder();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      notificationsEnabled ? "Notificaciones desactivadas" : "Notificaciones habilitadas",
      notificationsEnabled ? "Los recordatorios han sido desactivados." : "Los recordatorios están activados."
    );
  };

  const scheduleDailyReminder = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recordatorio Diario",
        body: "¡No olvides registrar tu entrada del día!",
        sound: "default",
      },
      trigger: { hour: 20, minute: 0, repeats: true },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} style={styles.scrollView}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("SecuritySettings")}
        >
          <Text style={styles.optionText}>Configurar Contraseñas</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Habilitar Autenticación Biométrica</Text>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometricAuth}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={biometricEnabled ? "#FFD700" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.settingItem}>
          <Text style={styles.label}>Activar Recordatorios</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={notificationsEnabled ? "#FFD700" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Tema de Color</Text>
          <Text style={styles.optionDetail}>Oscuro</Text>
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>Tamaño de Fuente</Text>
          <Text style={styles.optionDetail}>Mediano</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad y Datos</Text>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>Copia de Seguridad de Datos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => Alert.alert("Eliminar cuenta", "¿Estás seguro?")}
        >
          <Text style={styles.optionText}>Eliminar Cuenta y Datos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#2C3E50",
  },
  contentContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: "#4B4E6D",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  optionText: {
    fontSize: 16,
    color: "#F0E4C2",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4B4E6D",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: "#F0E4C2",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4B4E6D",
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionDetail: {
    fontSize: 16,
    color: "#F0E4C2",
    fontWeight: "600",
  },
});

export default SettingsScreen;
