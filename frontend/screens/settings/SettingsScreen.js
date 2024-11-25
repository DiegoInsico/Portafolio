import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
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

      if (Platform.OS === "android") {
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
      Alert.alert(
        "Biometría no disponible",
        "Este dispositivo no admite autenticación biométrica"
      );
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
    <ScrollView contentContainerStyle={styles.contentContainer}>
      {/* Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seguridad</Text>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate("SecuritySettings")}
        >
          <MaterialIcons name="lock" size={24} color="#333" />
          <Text style={styles.optionText}>Configurar Contraseñas</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Ionicons name="finger-print" size={24} color="#333" />
            <Text style={styles.label}>Autenticación Biométrica</Text>
          </View>
          <Switch
            value={biometricEnabled}
            onValueChange={toggleBiometricAuth}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={biometricEnabled ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Ionicons name="notifications" size={24} color="#333" />
            <Text style={styles.label}>Activar Recordatorios</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#767577", true: "#4CAF50" }}
            thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Apariencia */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apariencia</Text>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="color-palette" size={24} color="#333" />
          <View>
            <Text style={styles.optionText}>Tema</Text>
            <Text style={styles.optionDetail}>Claro</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionRow}>
          <Ionicons name="text" size={24} color="#333" />
          <View>
            <Text style={styles.optionText}>Tamaño de Fuente</Text>
            <Text style={styles.optionDetail}>Mediano</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Privacidad y Datos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad y Datos</Text>
        <TouchableOpacity style={styles.optionButton}>
          <MaterialIcons name="backup" size={24} color="#333" />
          <Text style={styles.optionText}>Copia de Seguridad</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => Alert.alert("Eliminar cuenta", "¿Estás seguro?")}
        >
          <MaterialIcons name="delete" size={24} color="#FF5555" />
          <Text style={[styles.optionText, { color: "#FF5555" }]}>
            Eliminar Cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexGrow: 1,
    backgroundColor: "#FFFFFF", // Fondo blanco
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#333333", // Gris oscuro
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9", // Fondo claro
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#333333",
    marginLeft: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionDetail: {
    fontSize: 14,
    color: "#555555",
  },
});

export default SettingsScreen;
