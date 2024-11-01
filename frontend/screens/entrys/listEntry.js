import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  View,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import PolaroidCard from "./polaroidCard";
import { LinearGradient } from "expo-linear-gradient";
import SongCard from "./songCard";
import TextCard from "./textCard";
import { listenToEntries } from "../../utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import EntryItem from "./entryItem";
import ProtectedAccess from "./../../components/ProtectedAccess";

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [showProtectedModal, setShowProtectedModal] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        const unsubscribeEntries = listenToEntries((fetchedEntries) => {
          setEntries(fetchedEntries);
          setIsLoading(false);
        });
        return () => {
          unsubscribeEntries && unsubscribeEntries();
        };
      } else {
        setIsAuthenticated(false);
        setEntries([]);
        setIsLoading(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  const handleLevelChange = (level) => {
    console.log("Nivel seleccionado:", level); // Verificar el nivel seleccionado
    if (level === "1") {
      setAccessGranted(true);
      setSelectedLevel(level);
    } else if (level === "2" || level === "3") {
      setAccessGranted(false);
      setSelectedLevel(level);
      setShowProtectedModal(true);
    }
  };

  const closeModal = () => {
    setSelectedEntry(null);
  };

  const onAccessGranted = () => {
    setAccessGranted(true);
    setShowProtectedModal(false);
  };

  const filteredEntries = entries.filter(
    (entry) => entry.nivel === selectedLevel
  );

  const getBackgroundColor = (level) => {
    console.log("Background color para nivel:", level); // Verificar qué color se está seleccionando
    if (level === "1") {
      return [
        "#2C3E50",
        "#4B4E6D",
        "#C2A66B",
        "#D1B17D",
        "#E6C47F",
        "#F0E4C2",
        "#F0E4C2",
        "#E6C47F",
        "#D1B17D",
        "#C2A66B",
        "#4B4E6D",
        "#2C3E50",
      ]; // Colores claros para nivel 1
    } else if (level === "2") {
      return ["#C2A66B", "#A58957", "#8E7D56", "#6E5C3B"]; // Colores más oscuros para nivel 2
    } else if (level === "3") {
      return ["#4B4E6D", "#333850", "#2C3E50", "#1B263B"]; // Colores oscuros y profundos para nivel 3
    }
  };

  if (!isAuthenticated) {
    return (
      <Text style={styles.message}>
        Por favor, inicia sesión para ver tus entradas.
      </Text>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.gradientContainer}>
        <LinearGradient
          colors={getBackgroundColor(selectedLevel)}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.background}
        >
          {/* Selector de Nivel */}
          <View style={styles.levelSelector}>
            <Text style={styles.label}>Explorar Profundidad:</Text>
            <Picker
              selectedValue={selectedLevel}
              onValueChange={handleLevelChange}
              style={styles.picker}
            >
              <Picker.Item
                style={styles.pickerText}
                label="1. Reflexiones Cotidianas"
                value="1"
              />
              <Picker.Item
                style={styles.pickerText}
                label="2. Confesiones del Corazon"
                value="2"
              />
              <Picker.Item
                style={styles.pickerText}
                label="3. Esencia Profunda"
                value="3"
              />
            </Picker>
          </View>

          {/* Lista de Entradas */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4B4E6D" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.container}>
              {accessGranted && filteredEntries.length === 0 ? (
                <Text style={styles.message}>
                  No hay entradas disponibles para el nivel seleccionado
                </Text>
              ) : (
                filteredEntries.map((entry) => {
                  const EntryComponent =
                    entry.mediaType === "image" || entry.mediaType === "video"
                      ? PolaroidCard
                      : entry.cancion
                      ? SongCard
                      : TextCard;

                  return (
                    <Pressable
                      key={entry.id}
                      onPress={() => setSelectedEntry(entry)}
                    >
                      <EntryComponent entry={entry} />
                    </Pressable>
                  );
                })
              )}

              {/* Modal que muestra los detalles de la entrada */}
              {selectedEntry && (
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={!!selectedEntry}
                  onRequestClose={closeModal}
                >
                  <EntryItem item={selectedEntry} onClose={closeModal} />
                </Modal>
              )}

              {/* Modal de acceso protegido */}
              {showProtectedModal && (
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={showProtectedModal}
                  onRequestClose={() => setShowProtectedModal(false)}
                >
                  <ProtectedAccess
                    nivel={selectedLevel}
                    onAccessGranted={onAccessGranted}
                    onClose={() => {
                      setShowProtectedModal(false);
                      setSelectedLevel("1");
                    }}
                  />
                </Modal>
              )}
            </ScrollView>
          )}
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradientContainer: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  container: {
    padding: 16,
    alignItems: "center",
  },
  message: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  levelSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F0E4C2",
    borderBottomWidth: 1,
    borderBottomColor: "#C2A66B",
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 20,
    fontSize: 10,
  },
  pickerText: {
    fontSize: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ListEntry;
