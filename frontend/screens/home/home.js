import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Dimensions, Animated, Easing, TouchableOpacity, FlatList, Image } from 'react-native';
import axios from 'axios';
import { Video } from 'expo-av';
import Navbar from '../../components/Header'; 
import { getAuth } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../utils/firebase'; // Asegúrate de tener la configuración correcta de Firebase
import { LinearGradient } from 'expo-linear-gradient';

const { width: viewportWidth } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [entries, setEntries] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserId(user.uid);
    } else {
      Alert.alert('Error', 'No se ha encontrado un usuario autenticado.');
      navigation.navigate('Login');
    }
  }, [navigation]);

  const fetchEntries = () => {
    if (!userId) return;

    // Realizamos la consulta a Firebase
    const q = query(
      collection(db, 'entries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
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
            isVideo: data.mediaURL ? data.mediaURL.endsWith('.mp4') || data.mediaURL.endsWith('.mov') : false,
            createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : '',
          });
        });
        setEntries(entriesData);
        setLoading(false);
      },
      (error) => {
        console.error("Error al obtener las entradas: ", error);
        setLoading(false);
        Alert.alert('Error', 'Ocurrió un error al obtener las entradas.');
      }
    );

    return () => unsubscribe();
  };

  useEffect(() => {
    if (userId) {
      fetchEntries();
    }
  }, [userId]);

  // Función para renderizar cada entrada
  const renderEntryItem = ({ item }) => {
    return (
      <View style={styles.entryContainer}>

        {item.media && item.isVideo ? (
          <Video
            source={{ uri: item.media }}
            style={styles.media}
            useNativeControls
            resizeMode="contain"
            isLooping
          />
        ) : item.media ? (
          <Image source={{ uri: item.media }} style={styles.media} resizeMode="cover" />
        ) : null}

        {item.text && (
          <View style={styles.textContainer}>
            <Text style={styles.entryText}>{item.text}</Text>
          </View>
        )}

        {item.createdAt && (
          <Text style={styles.createdAt}>{item.createdAt}</Text>
        )}
      </View>
    );
  };

  // Función para animar la opacidad de la pregunta
  const animateQuestion = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.bounce, // Animación de rebote
      useNativeDriver: true,
    }).start();
  };

  const fetchQuestion = () => {
    if (!userId) {
      console.error('No userId available');
      return;
    }

    setLoading(true);
    axios.get('http://10.0.2.2:3000/api/question', { params: { userId: userId } })
      .then(response => {
        setQuestion(response.data.question);
        setLoading(false);
        animateQuestion();
      })
      .catch(error => {
        console.error("Error fetching the question: ", error);
        setLoading(false);
      });
  };

  return (
    <LinearGradient
      colors={[
        "#D4AF37", // Dorado suave
        "#E6C47F", // Melocotón suave/dorado claro
        "#C2A66B", // Dorado oscuro más neutro
        "#4B4E6D", // Azul grisáceo oscuro para las sombras
        "#2C3E50", // Negro grisáceo oscuro en la parte inferior
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
      <Text style={styles.welcomeText}>¡Hola!</Text>
      <Text style={styles.subText}>Soy tu alma.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4B4E6D" />
      ) : (
        <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
          <Text style={styles.questionText}>
            {question || 'No se pudo cargar la pregunta'}
          </Text>
        </Animated.View>
      )}

      <TouchableOpacity onPress={fetchQuestion} style={styles.button}>
        <Text style={styles.buttonText}>Presioname para generar otra pregunta</Text>
      </TouchableOpacity>

        <Text style={styles.carouselTitle}>Tus Entradas Recientes</Text>


        <FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        />
        <View style={styles.navbarSpacing} />
        <Navbar />
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
    justifyContent: 'flex-start', // Posiciona el contenido en la parte superior
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    display: 'flex',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B4E6D',
    marginBottom: 10,
  },
  carouselContainer: {
    paddingHorizontal: 10,
    height: 300,
  },
  entryContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    width: viewportWidth * 0.8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  textContainer: {
    padding: 10,
  },
  entryText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  createdAt: {
    fontSize: 12,
    color: '#777',
    marginTop: 10,
  },
  navbarSpacing: {
    height: 85, // Espacio para que los elementos no queden ocultos detrás del Navbar
  },
});

export default Home;
