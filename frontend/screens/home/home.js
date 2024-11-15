// Home.js

import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
  RefreshControl,
  ImageBackground,
} from "react-native";
import axios from "axios";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { FontAwesome } from "@expo/vector-icons";
import ModalEntry from "../entrys/modalEntry";
import { ScrollView } from "react-native-gesture-handler";
import { StatusBar } from "react-native";
import { AuthContext } from "../../context/AuthContext";

const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  const { user, userData, loading: authLoading } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
  const today = new Date();
  const formattedDate = today.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) {
      return "Buenos días";
    } else if (hour < 18) {
      return "Buenas tardes";
    } else {
      return "Buenas noches";
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

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

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "Usuario");
      fetchEntries();
      fetchQuestion(user.uid);
    } else {
      Alert.alert("Sesión no iniciada", "Por favor inicia sesión para continuar.");
      navigation.navigate("Login");
    }
  }, [user]);

  const fetchQuestion = async (userId) => {
    try {
      const response = await axios.get(
        `http://192.168.1.12:3000/api/question?userId=${userId}`
      );
      setQuestion(response.data.question);
    } catch (error) {
      console.error("Error al obtener la pregunta:", error);
      Alert.alert("Error", "Ocurrió un error al obtener la pregunta de reflexión.");
    }
  };

  const fetchEntries = () => {
    if (!user) return;

    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.uid),
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

  if (authLoading || loading) {
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
    fetchQuestion(user.uid);
    setRefreshing(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require("../../assets/background/barco.jpg")}
        style={styles.background}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Animated.View
              style={[{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.greetingText}>
                  {getGreeting()}, {userName}
                </Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>

        {/* Sección Inferior Translucida */}
        <View style={styles.translucentBackground}>
          {question ? (
            <View style={styles.questionContainer}>
              <View style={styles.questionBackground}>
                <Text style={styles.generatedQuestionText}>{question}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.roundButtonContainer}
            onPress={handleOpenModal}
          >
            <View style={styles.roundButton}>
              <FontAwesome name="plus" size={24} color="#000" />
              <Text style={styles.roundButtonText}>Nuevo Instante</Text>
            </View>
          </TouchableOpacity>

          <ModalEntry visible={modalVisible} onClose={handleCloseModal} />
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  /* Estilos generales */
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginTop: 50,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  /* Sección Inferior Translucida */
  translucentBackground: {
    position: "absolute",
    bottom: 60, // Ajusta según necesidad
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  questionContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  questionBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscuro y translúcido
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  generatedQuestionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  /* Botón Redondo "Nuevo Instante" */
  roundButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  roundButton: {
    width: viewportWidth * 0.8, // 80% del ancho de la pantalla
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  roundButtonText: {
    fontSize: 18,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 10,
  },
  /* Estilos de carga */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
