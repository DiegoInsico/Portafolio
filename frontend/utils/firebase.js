// src/utils/firebase.js

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, getDocs, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Función para iniciar sesión
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario autenticado:", user.uid);
    return user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

// Función para cerrar sesión
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("Usuario ha cerrado sesión exitosamente.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

export const getEntries = async () => {
  try {
    const user = auth.currentUser;

    // Verificar si el usuario está autenticado
    if (!user) {
      console.log("No user is logged in");
      throw new Error("No user is logged in");
    }

    console.log("User ID:", user.uid);

    // Obtener solo las entradas del usuario actual y ordenarlas por fechaCreacion
    const entriesCollection = collection(db, "entradas");
    const q = query(
      entriesCollection,
      where("userId", "==", user.uid),
      orderBy("fechaCreacion", "desc") // Agregar ordenación por fechaCreacion
    );
    const snapshot = await getDocs(q);

    console.log("Fetched entries count:", snapshot.size);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      // Convertir los campos de fecha a objetos Date
      if (data.fechaCreacion && data.fechaCreacion.toDate) {
        data.fechaCreacion = data.fechaCreacion.toDate();
      } else {
        data.fechaCreacion = null;
      }
      if (data.fechaRecuerdo && data.fechaRecuerdo.toDate) {
        data.fechaRecuerdo = data.fechaRecuerdo.toDate();
      } else {
        data.fechaRecuerdo = null;
      }
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

export const getBeneficiarios = async () => {
  try {
    const user = auth.currentUser;

    // Verificar si el usuario está autenticado
    if (!user) {
      console.log("No user is logged in");
      throw new Error("No user is logged in");
    }

    const beneficiariesCollection = collection(db, "beneficiarios");
    const q = query(beneficiariesCollection, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });
  } catch (error) {
    console.error("Error fetching beneficiaries:", error);
    throw error;
  }
};

// Función para escuchar entradas en tiempo real
export const listenToEntries = (callback) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      console.error("No user is logged in");
      return;
    }

    const entriesCollection = collection(db, "entradas");
    const q = query(
      entriesCollection,
      where("userId", "==", user.uid),
      orderBy("fechaCreacion", "desc")
    );

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const entries = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Data del documento:", data);

          // Formatear fechas
          if (data.fechaCreacion && data.fechaCreacion.toDate) {
            const fecha = data.fechaCreacion.toDate();
            data.fechaCreacionFormatted = `${fecha
              .getDate()
              .toString()
              .padStart(2, "0")}/${(fecha.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${fecha.getFullYear()}`;
          }

          if (data.fechaRecuerdo && data.fechaRecuerdo.toDate) {
            const fechaRecuerdo = data.fechaRecuerdo.toDate();
            data.fechaRecuerdoFormatted = `${fechaRecuerdo
              .getDate()
              .toString()
              .padStart(2, "0")}/${(fechaRecuerdo.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${fechaRecuerdo.getFullYear()}`;
          }

          return { id: doc.id, ...data };
        });

        callback(entries);
      },
      (error) => {
        console.error("Error al escuchar las entradas:", error);
      }
    );

    return unsubscribeSnapshot;
  });

  return () => unsubscribe();
};

// Función para escuchar beneficiarios
export const listenToBeneficiaries = (userId, callback) => {
  const beneficiariesRef = collection(db, "beneficiarios");
  const q = query(beneficiariesRef, where("userId", "==", userId));

  return onSnapshot(
    q,
    (querySnapshot) => {
      const beneficiaries = [];
      querySnapshot.forEach((doc) => {
        beneficiaries.push({ id: doc.id, ...doc.data() });
      });
      callback(beneficiaries);
    },
    (error) => {
      console.error("Error al escuchar los beneficiarios:", error);
    }
  );
};

export { auth, db, storage };
