import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import ModalEntry from "../entrys/modalEntry";

const { width: viewportWidth } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  //Abrir y cerrar el Modal
  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  // Animaciones
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Detectar si hay una sesión activa al iniciar la app
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        Alert.alert(
          "Sesión no iniciada",
          "Por favor inicia sesión para continuar."
        );
        navigation.navigate("Login");
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  // Función para obtener la pregunta de la IA
  const fetchQuestion = async (userId) => {
    try {
      const response = await axios.get(
        `http://192.168.1.6:3000/api/question?userId=${userId}`
      );
      setQuestion(response.data.question);
    } catch (error) {
      console.error("Error al obtener la pregunta:", error);
      Alert.alert(
        "Error",
        "Ocurrió un error al obtener la pregunta de reflexión."
      );
    }
  };

  useEffect(() => {
    if (userId) {
      fetchEntries();
      fetchQuestion(userId); // Llamada a la IA para obtener la pregunta
    }
  }, [userId]);

  const fetchEntries = () => {
    if (!userId) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const entriesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entriesData.push({
            id: doc.id,
            text: data.message,
            media: data.mediaURL || null,
            isVideo: data.mediaURL
              ? data.mediaURL.endsWith(".mp4") || data.mediaURL.endsWith(".mov")
              : false,
            createdAt: data.createdAt
              ? data.createdAt.toDate().toLocaleDateString()
              : "",
          });
        });
        setEntries(entriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener las entradas: ", error);
        setLoading(false);
        Alert.alert("Error", "Ocurrió un error al obtener las entradas.");
      }
    );

    return () => unsubscribe();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B4E6D" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const onRefresh = () => {

    setRefreshing(true);
    fetchEntries();
    fetchQuestion(userId); // Volver a obtener la pregunta al refrescar
    setRefreshing(false);
  };

  return (
    <LinearGradient
      colors={[
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
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Animated.View
          style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        >
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
        </Animated.View>

        {/* Mostrar la pregunta de reflexión */}
        {question ? (
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question}</Text>
          </View>
        ) : null}

        {/* Contenedor de los botones */}
        <View style={styles.containerBoton}>
          {/* Botón circular "Nueva Entrada" */}
          <TouchableOpacity
            style={styles.roundButton}
            onPress={handleOpenModal}
          >
            <FontAwesome name="plus" size={32} color="#FFF" />
            <Text style={styles.roundButtonText}>Nueva Entrada</Text>
          </TouchableOpacity>
          {/* ModalEntry */}
          <ModalEntry visible={modalVisible} onClose={handleCloseModal} />

          <TouchableOpacity
            style={styles.baulButton}
            onPress={() => navigation.navigate("Baul")} // Aquí redirige a la pantalla 'Baul'
          >
            <FontAwesome name="archive" size={24} color="#FFF" />
            <Text style={styles.baulText}>Baúl</Text>
          </TouchableOpacity>

          {/* Contenedor de los botones pequeños (Configuración y Perfil) */}
          <View style={styles.smallButtonsContainer}>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => alert("Perfil")}
            >
              <FontAwesome name="user" size={24} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => alert("Configuración")}
            >
              <FontAwesome name="cog" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.navbarSpacing} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    width: 200,
    padding: 7,
    borderRadius: 10,
  },
  // Estilo del contenedor de botones
  containerBoton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  roundButton: {
    width: "45%",
    height: 100,
    borderRadius: 15,
    backgroundColor: "#FF6F61",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  roundButtonText: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
  },
  baulButton: {
    width: "30%",
    height: 100,
    backgroundColor: "#007ACC",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginLeft: 10,
  },
  baulText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  smallButtonsContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: 120, // Ajuste para el espacio entre los botones
    marginTop: 12,
    margin: 5,
  },
  smallButton: {
    width: 50,
    height: 50,
    backgroundColor: "#28A745",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 10,
    marginLeft: 10,
  },
  // Question con IA
  questionContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
  },
  // Carrusel
  carouselTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  carouselContainer: {
    paddingHorizontal: 10,
    height: 300,
  },
  entryContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 5,
    width: viewportWidth * 0.8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    padding: 10,
  },
  entryText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  createdAt: {
    fontSize: 12,
    color: "#777",
    marginTop: 10,
  },
  navbarSpacing: {
    height: 85,
  },
});

export default Home;
