// ListEntry.js

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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { listenToEntries, listenToBeneficiaries, db } from "../../utils/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import EntryCard from "./EntryCard"; // Asegúrate de que la ruta sea correcta
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Para el ícono de búsqueda y candado

const ListEntry = () => {
  const [entries, setEntries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("1"); // 1: Restringido, 2: Rojo, 3: Confidencial
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [userPasswords, setUserPasswords] = useState({ level2Password: "", level3Password: "" });
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
    setSelectedLevel(level);
  };

  const getBackgroundImage = (level) => {
    switch (level) {
      case "1":
        return require("../../assets/background/level1.webp"); // Reemplaza con la ruta correcta
      case "2":
        return require("../../assets/background/level1.webp"); // Reemplaza con la ruta correcta
      case "3":
        return require("../../assets/background/level1.webp"); // Reemplaza con la ruta correcta
      default:
        return require("../../assets/background/level1.webp"); // Imagen por defecto
    }
  };

  const getLockIconColor = (level) => {
    switch (level) {
      case "1":
        return "#00BFFF"; // Celeste
      case "2":
        return "#FF0000"; // Rojo
      case "3":
        return "#000000"; // Negro
      default:
        return "#FFFFFF"; // Blanco por defecto
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
          {/* Barra de búsqueda modernizada */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={24} color="#333333" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar entradas..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessible={true}
              accessibilityLabel="Barra de búsqueda"
              accessibilityHint="Permite buscar entradas por texto, emociones o fecha de creación"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} accessible={true} accessibilityLabel="Limpiar búsqueda" accessibilityHint="Limpia el texto de búsqueda">
                <Icon name="close-circle" size={24} color="#333333" style={styles.searchIcon} />
              </TouchableOpacity>
            )}
          </View>

          {/* Selector de Nivel actualizado */}
          <View style={styles.levelSelector}>
            <Text style={styles.label}>Nivel:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLevel}
                onValueChange={(itemValue) => handleLevelChange(itemValue)}
                style={styles.picker}
                mode="dropdown"
                accessibilityLabel="Selector de nivel"
                accessibilityHint="Selecciona el nivel de las entradas que deseas ver"
              >
                <Picker.Item label="Restringido" value="1" />
                <Picker.Item label="Rojo" value="2" />
                <Picker.Item label="Confidencial" value="3" />
              </Picker>
            </View>
            <Icon
              name="lock"
              size={24}
              color={getLockIconColor(selectedLevel)}
              style={styles.lockIcon}
              accessible={true}
              accessibilityLabel={`Icono de nivel ${selectedLevel}`}
              accessibilityHint="Indica el nivel de seguridad de las entradas seleccionadas"
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
                    navigation.navigate("EntryDetailScreen", { // Asegúrate de usar "EntryDetailScreen"
                      item,
                      beneficiaries,
                    })
                  }
                />
              )}
              ListEmptyComponent={
                <Text style={styles.message}>
                  No hay entradas disponibles para el nivel seleccionado
                </Text>
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
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
