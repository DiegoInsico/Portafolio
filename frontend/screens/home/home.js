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
import { Video } from "expo-av";
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

const { width: viewportWidth } = Dimensions.get("window");

const Home = ({ navigation }) => {
  // FUNCIONALIDADES
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Estado para el refresh

  // CONST DE ANIMACIONES
  const scrollX = useRef(new Animated.Value(0)).current; // Animación del desplazamiento

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

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
        // Usuario autenticado
        setUserId(user.uid);
        setLoading(false);
      } else {
        // No hay un usuario autenticado
        Alert.alert(
          "Sesión no iniciada",
          "Por favor inicia sesión para continuar."
        );
        navigation.navigate("Login"); // Navegar a la página de inicio de sesión si no está autenticado
      }
    });

    // Limpiar el listener al desmontar el componente
    return () => unsubscribe();
  }, [navigation]);

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

  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4B4E6D" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true); // Inicia el estado de refresh
    fetchEntries(); // Llama a la función que refresca las entradas
    setRefreshing(false); // Termina el estado de refresh
  };

  const renderEntryItem = ({ item, index }) => {
    // Rango de entrada para la interpolación de escala y opacidad
    const inputRange = [
      (index - 1) * viewportWidth * 0.8,
      index * viewportWidth * 0.8,
      (index + 1) * viewportWidth * 0.8,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[styles.entryContainer, { transform: [{ scale }], opacity }]}
      >
        {item.media && item.isVideo ? (
          <Video
            source={{ uri: item.media }}
            style={styles.media}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : item.media ? (
          <Image
            source={{ uri: item.media }}
            style={styles.media}
            resizeMode="cover"
          />
        ) : null}

        {item.text && (
          <View style={styles.textContainer}>
            <Text style={styles.entryText}>{item.text}</Text>
          </View>
        )}

        {item.createdAt && (
          <Text style={styles.createdAt}>{item.createdAt}</Text>
        )}
      </Animated.View>
    );
  };

  const animateQuestion = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  const fetchQuestion = () => {
    if (!userId) {
      console.error("No userId available");
      return;
    }

    setLoading(true);
    axios
      .get("http://10.0.2.2:3000/api/question", { params: { userId: userId } })
      .then((response) => {
        setQuestion(response.data.question);
        setLoading(false);
        animateQuestion();
      })
      .catch((error) => {
        console.error("Error fetching the question: ", error);
        setLoading(false);
      });
  };

  return (
    <LinearGradient
      colors={["#1C1C1C", "#1C1C1C"]}
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

        {loading ? (
          <ActivityIndicator size="large" color="#4B4E6D" />
        ) : (
          <Animated.View
            style={[styles.questionContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.questionText}>
              {question || "No se pudo cargar la pregunta"}
            </Text>
          </Animated.View>
        )}

        <TouchableOpacity onPress={fetchQuestion} style={styles.button}>
          <Text style={styles.buttonText}>
            Presioname para generar otra pregunta
          </Text>
        </TouchableOpacity>

        <Text style={styles.carouselTitle}>Tus Entradas Recientes</Text>

        <Animated.FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
          snapToInterval={viewportWidth * 0.8} // Hace que los items "encajen" en el centro
          decelerationRate="fast"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />

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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
    textAlign: "center",
    backgroundColor: "#FFD700",
    width: 200,
    padding: 7,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
  },
  button: {
    display: "flex",
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
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
    marginRight: 1,
    margin: 2,
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
