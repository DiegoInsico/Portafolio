import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBRI4q2P-BbqG43sJkApiF-ifVLQZlsxnU",
  authDomain: "soul2024-abe2f.firebaseapp.com",
  projectId: "soul2024-abe2f",
  storageBucket: "soul2024-abe2f.appspot.com",
  messagingSenderId: "507152982336",
  appId: "1:507152982336:web:4504d3d9195e090bc25aa5",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa los servicios de Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Función para iniciar sesión y guardar la sesión
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar el ID token del usuario en AsyncStorage
    await AsyncStorage.setItem('userToken', user.uid);

    console.log('Usuario autenticado y token guardado');
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

// Recuperar el estado de autenticación
export const checkAuthState = async () => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      console.log('Usuario ya autenticado');
      // Aquí puedes redirigir al usuario a la pantalla principal
    } else {
      console.log('No hay sesión activa');
      // Puedes redirigir al usuario a la pantalla de login
    }
  } catch (error) {
    console.error('Error al verificar el estado de la sesión:', error);
  }
};

// Escuchar el estado de autenticación de Firebase
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('Usuario autenticado automáticamente:', user.uid);
    // Almacenar el estado de sesión
    await AsyncStorage.setItem('userToken', user.uid);
  } else {
    console.log('Usuario no autenticado');
    // Eliminar la sesión si el usuario cierra sesión
    await AsyncStorage.removeItem('userToken');
  }
});

// Función para obtener las entradas desde Firestore
export const getEntries = async () => {
  try {
    const user = auth.currentUser;

    // Verificar si el usuario está autenticado
    if (!user) {
      console.log("No user is logged in");
      throw new Error("No user is logged in");
    }

    console.log("User ID:", user.uid);

    // Obtener solo las entradas del usuario actual
    const entriesCollection = collection(db, 'entradas');
    const q = query(entriesCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    console.log("Fetched entries count:", snapshot.size);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Convertir los campos de fecha a un formato legible si es necesario
      if (data.fechaCreacion && data.fechaCreacion.toDate) {
        data.fechaCreacion = data.fechaCreacion.toDate().toLocaleString();
      }
      if (data.fechaRecuerdo && data.fechaRecuerdo.toDate) {
        data.fechaRecuerdo = data.fechaRecuerdo.toDate().toLocaleString();
      }
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

export { auth, db, storage };
