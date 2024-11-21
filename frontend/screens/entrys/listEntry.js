// ListEntry.js
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  View,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import PolaroidCard from "./polaroidCard";
import SongCard from "./songCard";
import TextCard from "./textCard";
import AudioCard from "./AudioCard"; // Importa el AudioCard si lo usas
import { listenToEntries, listenToBeneficiaries, db } from "../../utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import EntryItem from "./entryItem";
import ProtectedAccess from "../../components/ProtectedAccess";

const ListEntry = ({ user }) => {
  const [entries, setEntries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [showProtectedModal, setShowProtectedModal] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [password, setPassword] = useState("");
  const [userPasswords, setUserPasswords] = useState({ level2Password: "", level3Password: "" });
  const [selectedEntryId, setSelectedEntryId] = useState(null); // Nuevo estado para rastrear la tarjeta seleccionada

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
          entry.fechaCreacion
            ?.toDate()
            .toLocaleDateString("es-ES")
            .includes(searchQuery))
    );
    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedLevel]);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setAccessGranted(false);
    if (level === "1") {
      setAccessGranted(true);
    } else {
      setShowProtectedModal(true);
    }
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setSelectedEntryId(null); // Reiniciar el ID de la tarjeta seleccionada
  };

  const onAccessGranted = () => {
    setAccessGranted(true);
    setShowProtectedModal(false);
    setPassword("");
  };

  const handlePasswordSubmit = () => {
    const correctPassword =
      selectedLevel === "2" ? userPasswords.level2Password : userPasswords.level3Password;

    if (password === correctPassword) {
      onAccessGranted();
    } else {
      Alert.alert("Error", "Contraseña incorrecta. Inténtalo de nuevo.");
    }
  };

  const getBackgroundImage = (level) => {
    if (level === "1") {
      return require("../../assets/background/level1.jpg");
    } else if (level === "2") {
      return require("../../assets/background/level2.jpg");
    } else if (level === "3") {
      return require("../../assets/background/level3.jpg");
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
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar entradas..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Selector de Nivel */}
          <View style={styles.levelSelector}>
            <Text style={styles.label}>Profundidad:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLevel}
                onValueChange={handleLevelChange}
                style={styles.picker}
                dropdownIconColor="#4B4E6D"
              >
                <Picker.Item label="Diario" value="1" />
                <Picker.Item label="Personal" value="2" />
                <Picker.Item label="Íntimo" value="3" />
              </Picker>
            </View>
          </View>

          {/* Lista de Entradas */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B4E6D" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.container}
              showsVerticalScrollIndicator={false}
            >
              {accessGranted && filteredEntries.length === 0 ? (
                <Text style={styles.message}>
                  No hay entradas disponibles para el nivel seleccionado
                </Text>
              ) : (
                filteredEntries.map((entry) => {
                  let EntryComponent = TextCard; // Predeterminado

                  if (entry.mediaType === "image" || entry.mediaType === "video") {
                    EntryComponent = PolaroidCard;
                  } else if (entry.cancion) {
                    EntryComponent = SongCard;
                  } else if (entry.audio && !entry.cancion && !entry.mediaType) {
                    EntryComponent = AudioCard;
                  }

                  return (
                    <EntryComponent
                    key={entry.id}
                    entry={entry}
                    isSelected={entry.id === selectedEntryId}
                    onPress={() => {
                      setSelectedEntry(entry);
                      setSelectedEntryId(entry.id); // Establecer el ID de la tarjeta seleccionada
                    }}
                  />
                  );
                })
              )}
            </ScrollView>
          )}

          {/* Modal que muestra los detalles de la entrada */}
          {selectedEntry && (
            <Modal
              animationType="slide"
              transparent={true}
              visible={!!selectedEntry}
              onRequestClose={closeModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <EntryItem
                    item={selectedEntry}
                    onClose={closeModal}
                    beneficiaries={beneficiaries}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Modal de acceso protegido */}
          {showProtectedModal && (
            <Modal
              animationType="fade"
              transparent={true}
              visible={showProtectedModal}
              onRequestClose={() => setShowProtectedModal(false)}
            >
              <View style={styles.fullScreenModalOverlay}>
                <View style={styles.fullScreenModalContent}>
                  <Text style={styles.modalTitle}>Acceso Protegido</Text>
                  <Text style={styles.modalMessage}>
                    Estás intentando acceder a un nivel más profundo de tus
                    entradas. Este nivel requiere una verificación de acceso.
                  </Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Introduce la contraseña"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handlePasswordSubmit}
                  >
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowProtectedModal(false);
                      setSelectedLevel("1");
                    }}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
    paddingTop: 25, // Espaciado superior para evitar superposición con la barra de estado
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Fondo oscuro y semitransparente
    padding: 12,
    paddingBottom: 60,
  },
  searchContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: "#ffffff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressable: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  modalContent: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
  },
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)", // Cubre toda la pantalla
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenModalContent: {
    width: "90%",
    backgroundColor: "#F0E4C2", // Fondo suave y claro
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4B4E6D",
    marginBottom: 10,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#4B4E6D",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  passwordInput: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#C2A66B",
    padding: 10,
    backgroundColor: "#fff",
    color: "#4B4E6D",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginVertical: 5,
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  modalButtonText: {
    fontSize: 16,
    color: "#1C2833",
    fontWeight: "bold",
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: "#B0AFAF",
    fontWeight: "bold",
  },
});

export default ListEntry;
