import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot, query, where, orderBy } from "firebase/firestore";
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

// Inicializa Auth con persistencia usando AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializa los servicios de Firebase
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
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('Usuario autenticado:', user.uid);
      // Redirigir al usuario o permitir acceso
    } else {
      console.log('No hay sesión activa');
      // Redirigir a la pantalla de inicio de sesión
    }
  });
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


export { auth, db, storage };
