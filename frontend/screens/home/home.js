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
  ImageBackground,
  StatusBar,
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
import { AuthContext } from "../../context/AuthContext";
import SideBarMenu from "../../components/navigation/sideBarMenu";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Para los íconos de búsqueda
import { categoryColors } from "../../utils/categoryColors"; // Importa categoryColors

const { width: viewportWidth } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

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

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };

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

  const handleOpenModal = (categoria) => {
    setSelectedCategory(categoria);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCategory("");
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
      Alert.alert(
        "Sesión no iniciada",
        "Por favor inicia sesión para continuar."
      );
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
      Alert.alert(
        "Error",
        "Ocurrió un error al obtener la pregunta de reflexión."
      );
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
            text: data.texto,
            media: data.media || null,
            isVideo: data.mediaType === "video",
            createdAt: data.fechaCreacion
              ? data.fechaCreacion.toDate().toLocaleDateString()
              : "",
            nickname: data.nickname || "",
            color: data.color || "#ffffff",
            categoria: data.categoria || "",
            mediaType: data.mediaType || "text",
            nivel: data.nivel || "1", // Asegurar que nivel está presente
            emociones: data.emociones || [], // Añadir emociones si están presentes
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

  // Definición de categorías con imágenes y colores pastel
  const categories = [
    {
      id: "1",
      name: "Alegria",
      image: require("../../assets/icons/Alegria.png"),
      color: categoryColors.Alegria,
      emotion: "Alegria",
    },
    {
      id: "2",
      name: "Tristeza",
      image: require("../../assets/icons/Tristeza.png"),
      color: categoryColors.Tristeza,
      emotion: "Tristeza",
    },
    {
      id: "3",
      name: "Ira",
      image: require("../../assets/icons/Ira.png"),
      color: categoryColors.Ira,
      emotion: "Ira",
    },
    {
      id: "4",
      name: "Miedo",
      image: require("../../assets/icons/Miedo.png"),
      color: categoryColors.Miedo,
      emotion: "Miedo",
    },
    {
      id: "5",
      name: "Idea",
      image: require("../../assets/icons/Idea.png"),
      color: categoryColors.Idea,
      emotion: "Idea",
    },
    {
      id: "6",
      name: "Consejo",
      image: require("../../assets/icons/Consejo.png"),
      color: categoryColors.Consejo,
      emotion: "Consejo",
    },
  ];

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ImageBackground
        source={require("../../assets/background/fondo2.webp")} // Asegúrate de tener esta imagen en la ruta indicada
        style={styles.background}
        resizeMode="cover"
      >
        {/* Botón para abrir el menú */}
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <FontAwesome name="bars" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.container}>
          <Animated.View
            style={[
              styles.headerAnimated,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.headerContainer}>
              <Text style={styles.greetingText}>
                {getGreeting()}, {userName}
              </Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            {/* Pregunta autogenerada */}
            {question && (
              <View style={styles.questionContainer}>
                <View style={styles.questionBackground}>
                  <Text style={styles.generatedQuestionText}>{question}</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Sección baja: Pregunta y botones */}
          <View style={styles.footerSection}>
            {/* Botones superiores */}
            <View style={styles.buttonsRow}>
              {categories.slice(0, 3).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.squareButton,
                    { backgroundColor: category.color },
                  ]}
                  onPress={() =>
                    navigation.navigate("Entry", { category: category.name })
                  }
                >
                  <Image source={category.image} style={styles.buttonImage} />
                  <Text style={styles.buttonText}>{category.emotion}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Botones inferiores */}
            <View style={styles.buttonsRow}>
              {categories.slice(3, 6).map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.squareButton,
                    { backgroundColor: category.color },
                  ]}
                  onPress={() =>
                    navigation.navigate("Entry", { category: category.name })
                  }
                >
                  <Image source={category.image} style={styles.buttonImage} />
                  <Text style={styles.buttonText}>{category.emotion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
      <SideBarMenu
        isVisible={menuVisible}
        toggleMenu={toggleMenu}
        navigateToHome={() => {
          toggleMenu();
          navigation.navigate("Home");
        }}
        navigateToEntries={() => {
          toggleMenu();
          navigation.navigate("ListEntry");
        }}
        navigateToProfile={() => {
          toggleMenu();
          navigation.navigate("Profile");
        }}
        navigateToSettings={() => {
          toggleMenu();
          navigation.navigate("Settings");
        }}
        navigateToTestigos={() => {
          toggleMenu();
          navigation.navigate("Testigos");
        }}
        navigateToBeneficiarios={() => {
          toggleMenu();
          navigation.navigate("Beneficiarios");
        }}
        navigateToProgramarMensaje={() => {
          toggleMenu();
          navigation.navigate("ProgramarMensaje");
        }}
        navigateToSoporte={() => {
          toggleMenu();
          navigation.navigate("Soporte");
        }}
        handleSignOut={() => {
          toggleMenu();
          console.log("Cerrando sesión...");
        }}
      />
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
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  headerAnimated: {
    // Permite la animación del header
  },
  headerContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000", // Ajustado para mejor contraste sobre el fondo
  },
  dateText: {
    fontSize: 16,
    color: "#000", // Ajustado para mejor contraste sobre el fondo
    marginTop: 5,
  },
  menuButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
    margin: 10,
  },
  /* Sección Inferior */
  footerSection: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  questionContainer: {
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  questionBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Fondo oscuro y translúcido
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  generatedQuestionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  /* Botones */
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%",
  },
  squareButton: {
    width: viewportWidth * 0.22, // Botones cuadrados
    height: viewportWidth * 0.22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 35, // Ajuste de borderRadius para modernizar
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 5,
  },
  buttonImage: {
    width: "60%",
    height: "60%",
    resizeMode: "contain",
  },
  buttonText: {
    marginTop: 5,
    fontSize: 14,
    color: "#333333",
    textAlign: "center",
    fontWeight: "600",
  },
  /* Estilos de carga */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Home;
