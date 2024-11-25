import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { listenToEntries, listenToBeneficiaries, db } from "../../utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import EntryCard from "./EntryCard";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [userPasswords, setUserPasswords] = useState({ level2Password: "", level3Password: "" });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [isLevelUnlocked, setIsLevelUnlocked] = useState({ level2: false, level3: false });
  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);

        // Obtener las contraseñas de los niveles desde Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const { level2Password, level3Password } = userDoc.data();
          setUserPasswords({ level2Password, level3Password });
        }

        const unsubscribeEntries = listenToEntries((fetchedEntries) => {
          setEntries(fetchedEntries);
          setIsLoading(false);
        });
        const unsubscribeBeneficiaries = listenToBeneficiaries(user.uid, (fetchedBeneficiaries) => {
          setBeneficiaries(fetchedBeneficiaries);
        });
        return () => {
          unsubscribeEntries && unsubscribeEntries();
          unsubscribeBeneficiaries && unsubscribeBeneficiaries();
        };
      } else {
        setIsAuthenticated(false);
        setEntries([]);
        setBeneficiaries([]);
        setIsLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const filtered = entries.filter(
      (entry) =>
        entry.nivel === selectedLevel &&
        (entry.texto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.emociones?.some((emotion) =>
            emotion.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          (entry.fechaCreacion &&
            new Date(entry.fechaCreacion.seconds * 1000)
              .toLocaleDateString("es-ES")
              .includes(searchQuery)))
    );
    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedLevel]);

  const handleLevelChange = (level) => {
    if (level === "2" && !isLevelUnlocked.level2) {
      setPasswordModalVisible(true);
    } else if (level === "3" && !isLevelUnlocked.level3) {
      setPasswordModalVisible(true);
    } else {
      setSelectedLevel(level);
    }
  };

  const handlePasswordSubmit = () => {
    if (
      (selectedLevel === "2" && inputPassword === userPasswords.level2Password) ||
      (selectedLevel === "3" && inputPassword === userPasswords.level3Password)
    ) {
      Alert.alert("Éxito", "Nivel desbloqueado correctamente.");
      setIsLevelUnlocked((prev) => ({
        ...prev,
        [`level${selectedLevel}`]: true,
      }));
      setPasswordModalVisible(false);
      setInputPassword("");
      setSelectedLevel(selectedLevel); // Cambiar al nivel seleccionado
    } else {
      Alert.alert("Error", "Contraseña incorrecta. Intenta nuevamente.");
    }
  };

  const getBackgroundImage = (level) => {
    switch (level) {
      case "1":
        return require("../../assets/background/level1.webp");
      case "2":
        return require("../../assets/background/level1.webp");
      case "3":
        return require("../../assets/background/level1.webp");
      default:
        return require("../../assets/background/level1.webp");
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>
          Por favor, inicia sesión para ver tus entradas.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={getBackgroundImage(selectedLevel)}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Barra de búsqueda */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={24} color="#333333" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar entradas..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Icon name="close-circle" size={24} color="#333333" style={styles.searchIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Selector de Nivel */}
          <View style={styles.levelSelector}>
            <Text style={styles.label}>Nivel:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLevel}
                onValueChange={(itemValue) => handleLevelChange(itemValue)}
                style={styles.picker}
                mode="dropdown"
              >
                <Picker.Item label="Restringido" value="1" />
                <Picker.Item label="Rojo" value="2" />
                <Picker.Item label="Confidencial" value="3" />
              </Picker>
            </View>
            <Icon
              name="lock"
              size={24}
              color={selectedLevel === "1" ? "#00BFFF" : selectedLevel === "2" ? "#FF0000" : "#000000"}
              style={styles.lockIcon}
            />
          </View>

          {/* Lista de Entradas */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B4E6D" />
            </View>
          ) : (
            <FlatList
              data={filteredEntries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EntryCard
                  entry={item}
                  onPress={() =>
                    navigation.navigate("EntryDetailScreen", {
                      item,
                      beneficiaries,
                    })
                  }
                />
              )}
              ListEmptyComponent={
                <Text style={styles.message}>
                  No hay entradas disponibles para el nivel seleccionado.
                </Text>
              }
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>
      </ImageBackground>

      {/* Modal para Contraseñas */}
      <Modal visible={passwordModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Introduce la Contraseña</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Contraseña"
              placeholderTextColor="#888888"
              secureTextEntry
              value={inputPassword}
              onChangeText={setInputPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.modalButtonText}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setPasswordModalVisible(false);
                  setInputPassword("");
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: 50,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)", // Fondo oscuro y semitransparente
    padding: 12,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
  },
  levelSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: "#333333",
    marginRight: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 40,
    color: "#333333",
    backgroundColor: "transparent",
  },
  lockIcon: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
  },
});

export default ListEntry;
