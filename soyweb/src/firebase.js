// src/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// **Funciones Existentes**

export const getBeneficiarios = async () => {
  try {
    const beneficiariosCollection = collection(db, "beneficiarios");
    const snapshot = await getDocs(beneficiariosCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener beneficiarios:", error);
    throw error;
  }
};

export const getMensajesForUser = async (email) => {
  try {
    const mensajesRef = collection(db, "mensajesProgramados");
    const q = query(
      mensajesRef,
      where("email", "==", email),
      where("enviado", "==", true)
    );
    const snapshot = await getDocs(q);
    const mensajes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return mensajes;
  } catch (error) {
    console.error("Error al obtener los mensajes para el usuario:", error);
    throw error;
  }
};

// Función para obtener las entradas de un usuario específico
export const getEntradas = async (userId) => {
    try {
      const entradasCollection = collection(db, "entradas");
      const q = query(entradasCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);
  
      return snapshot.docs.map((doc) => {
        const data = doc.data();
  
        // Convertir fechas a objetos Date
        data.fechaCreacion = data.fechaCreacion
          ? data.fechaCreacion.toDate
            ? data.fechaCreacion.toDate()
            : new Date(data.fechaCreacion)
          : null;
  
        data.fechaRecuerdo = data.fechaRecuerdo
          ? data.fechaRecuerdo.toDate
            ? data.fechaRecuerdo.toDate()
            : new Date(data.fechaRecuerdo)
          : null;
  
        // Asegurar que 'nivel' es una cadena
        data.nivel = data.nivel ? data.nivel.toString() : "1";
  
        // Definir valores predeterminados para los campos
        return {
          id: doc.id,
          audio: data.audio || null,
          baul: data.baul || false,
          cancion: data.cancion || null,
          categoria: data.categoria || "",
          color: data.color || "#000000",
          emociones: data.emociones || [],
          fechaCreacion: data.fechaCreacion || null,
          fechaRecuerdo: data.fechaRecuerdo || null,
          isProtected: data.isProtected || false,
          media: data.media || null,
          mediaType: data.mediaType || null,
          nickname: data.nickname || "",
          nivel: data.nivel || "1",
          texto: data.texto || "",
          userId: data.userId || "",
        };
      });
    } catch (error) {
      console.error("Error fetching entries:", error);
      throw error;
    }
  };
  

// Función para obtener reflexiones de una entrada
export const getReflexiones = async (userId, entradaId) => {
    try {
      const reflexionesCollection = collection(
        db,
        "entradas",
        entradaId,
        "reflexiones"
      );
      const snapshot = await getDocs(reflexionesCollection);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .map((reflexion) => reflexion.texto); // Asumiendo que cada reflexión tiene un campo 'texto'
    } catch (error) {
      console.error("Error al obtener reflexiones:", error);
      return [];
    }
  };
  

export const getUsers = async () => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
};

export const getMensajesProgramados = async () => {
  try {
    const mensajesCollection = collection(db, "mensajesProgramados");
    const snapshot = await getDocs(mensajesCollection);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener mensajes programados:", error);
    throw error;
  }
};

// Función para iniciar sesión y guardar la sesión en localStorage
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    localStorage.setItem("userToken", user.uid); // Guarda el token en localStorage
    console.log("Usuario autenticado y token guardado");
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

// Función para crear un nuevo usuario
export const createUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    localStorage.setItem("userToken", user.uid); // Guarda el token en localStorage
    console.log("Usuario creado y autenticado:", user.uid);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

// Función para cerrar sesión
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem("userToken"); // Limpia el token si lo estás usando
    console.log("Usuario ha cerrado sesión");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    throw error;
  }
};

// Funciones relacionadas con álbumes
export const getAlbums = async (userId) => {
  try {
    const albumsCollection = collection(db, "users", userId, "albums");
    const snapshot = await getDocs(albumsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener álbumes:", error);
    throw error;
  }
};

export const createAlbum = async (
  userId,
  albumName,
  backgroundColor = "#ffffff",
  beneficiarioId
) => {
  try {
    const albumsCollection = collection(db, "users", userId, "albums");
    const newAlbum = {
      name: albumName,
      backgroundColor: backgroundColor,
      entries: [], // Inicialmente vacío
      beneficiarioId: beneficiarioId, // Asociar al beneficiario
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(albumsCollection, newAlbum);
    console.log("Álbum creado con ID: ", docRef.id);
    return { id: docRef.id, ...newAlbum };
  } catch (error) {
    console.error("Error al crear álbum:", error);
    throw error;
  }
};

export const updateAlbum = async (userId, albumId, updatedData) => {
  try {
    const albumDocRef = doc(db, "users", userId, "albums", albumId);
    await updateDoc(albumDocRef, updatedData);
    console.log("Álbum actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el álbum:", error);
    throw error;
  }
};

export const deleteAlbum = async (userId, albumId) => {
  try {
    const albumDocRef = doc(db, "users", userId, "albums", albumId);
    await deleteDoc(albumDocRef);
    console.log("Álbum eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar el álbum:", error);
    throw error;
  }
};

// Funciones relacionadas con entradas

export const getEntries = async (user) => {
    try {
        const entradasCollection = collection(db, 'entradas');
        const q = query(entradasCollection, where("userId", "==", user.uid)); // Usa user.uid en lugar de user
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();

            // Formateo de fecha para fechaCreacion y fechaRecuerdo
            if (data.fechaCreacion && data.fechaCreacion.toDate) {
                const fecha = data.fechaCreacion.toDate();
                data.fechaCreacion = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
            }
            if (data.fechaRecuerdo && data.fechaRecuerdo.toDate) {
                const fechaRecuerdo = data.fechaRecuerdo.toDate();
                data.fechaRecuerdo = `${fechaRecuerdo.getDate()}/${fechaRecuerdo.getMonth() + 1}/${fechaRecuerdo.getFullYear()}`;
            }

            // Definir valores predeterminados para los campos
            return {
                id: doc.id,
                audio: data.audio || null,
                baul: data.baul || false,
                cancion: data.cancion || null,
                categoria: data.categoria || '',
                color: data.color || '#000000',
                emociones: data.emociones || [],
                fechaCreacion: data.fechaCreacion || null,
                fechaRecuerdo: data.fechaRecuerdo || null,
                isProtected: data.isProtected || false,
                media: data.media || null,
                mediaType: data.mediaType || null,
                nickname: data.nickname || '',
                nivel: data.nivel || '1',
                texto: data.texto || '',
                userId: data.userId || ''
            };
        });
    } catch (error) {
        console.error("Error fetching entries:", error);
        throw error;


export const getAlbumEntries = async (userId, albumId) => {
  try {
    const albumEntriesCollection = collection(
      db,
      "users",
      userId,
      "albums",
      albumId,
      "entries"
    );
    const snapshot = await getDocs(albumEntriesCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener entradas del álbum:", error);
    throw error;
  }
};

// Función para obtener el color de fondo de un álbum
export const getAlbumBackground = async (userId, albumId) => {
  try {
    const albumDocRef = doc(db, "users", userId, "albums", albumId);
    const albumSnapshot = await getDoc(albumDocRef);
    if (albumSnapshot.exists()) {
      return albumSnapshot.data().backgroundColor;
    }
    return "#ffffff"; // Valor predeterminado si no existe
  } catch (error) {
    console.error("Error al obtener el color de fondo del álbum:", error);
    return "#ffffff"; // Retornar valor predeterminado en caso de error
  }
};

export const updateAlbumEntriesInDB = async (userId, albumId, entriesData) => {
    try {
        const albumDocRef = doc(db, 'users', userId, 'albums', albumId);

        // Aquí actualizamos el álbum con las entradas y sus posiciones
        await updateDoc(albumDocRef, { entries: entriesData });
        console.log("Entradas del álbum actualizadas correctamente");
    } catch (error) {
        console.error("Error al actualizar las entradas del álbum:", error);
        throw error;
    }
export const updateAlbumEntriesInDB = async (
  userId,
  albumId,
  newEntriesIds
) => {
  try {
    const albumDocRef = doc(db, "users", userId, "albums", albumId);
    await updateDoc(albumDocRef, { entries: newEntriesIds });
    console.log("Entradas del álbum actualizadas correctamente");
  } catch (error) {
    console.error("Error al actualizar las entradas del álbum:", error);
    throw error;
  }
};
// Función para actualizar el color de fondo de un álbum
export const setAlbumBgColor = async (userId, albumId, color) => {
  try {
    const albumDocRef = doc(db, "users", userId, "albums", albumId);
    await updateDoc(albumDocRef, { backgroundColor: color });
    console.log("Color de fondo del álbum actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el color de fondo del álbum:", error);
    throw error;
  }
};

// Funciones para documentos
export const addDocument = async (userId, { title, texto, testigo }) => {
  try {
    const documentCollection = collection(db, "documentos");
    const newDocument = {
      userId,
      title,
      texto,
      testigo,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(documentCollection, newDocument);
    console.log("Documento creado con ID:", docRef.id);
    return { id: docRef.id, ...newDocument };
  } catch (error) {
    console.error("Error al agregar documento:", error);
    throw error;
  }
};

export const editDocument = async (documentId, updatedData) => {
  try {
    const docRef = doc(db, "documentos", documentId);
    await updateDoc(docRef, updatedData);
    console.log("Documento actualizado con éxito:", documentId);
  } catch (error) {
    console.error("Error al actualizar el documento:", error);
    throw error;
  }
};

export const deleteDocument = async (documentId) => {
    try {
        const docRef = doc(db, "documentos", documentId);
        await deleteDoc(docRef);
        console.log("Documento eliminado con éxito:", documentId);
    } catch (error) {
        console.error("Error al eliminar el documento:", error);
        throw error;
    }
};

// Función para obtener los documentos de un usuario específico
export const getDocuments = async (userId) => {
  try {
    const documentsCollection = collection(db, "documentos");
    const q = query(documentsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    throw error;
  }
};

export const getTestigos = async (userId) => {

    try {
        const testigosCollection = collection(db, "testigos");
        const q = query(testigosCollection, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        console.log("Consulta realizada para el userId:", userId);
        console.log("Cantidad de testigos obtenidos:", snapshot.size);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error("Error al obtener testigos:", error);
        throw error;
    }

  try {
    const testigosCollection = collection(db, "testigos");
    const q = query(testigosCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error al obtener testigos:", error);
    throw error;
  }

};


// **Nueva Función para Obtener un Usuario por ID**
export const getUserById = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      console.log("No existe el usuario con el ID proporcionado.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    throw error;
  }
};

// **Subir PDF directamente a Firebase Storage**
export const uploadPdfToStorage = async (userId, pdfBlob) => {
  try {
    // Crea una referencia en Storage
    const pdfRef = ref(storage, `pdfs/${userId}/documento.pdf`);
    // Sube el archivo
    await uploadBytes(pdfRef, pdfBlob, { contentType: "application/pdf" });
    // Obtén la URL del archivo subido
    const pdfUrl = await getDownloadURL(pdfRef);
    return pdfUrl;
  } catch (error) {
    console.error("Error al subir el PDF a Storage:", error);
    throw error;
  }
};

// **Guardar la URL en Firestore**
export const savePdfUrlInFirestore = async (userId, pdfUrl) => {
  try {
    const pdfDocRef = doc(db, "pdfs", userId);
    await setDoc(
      pdfDocRef,
      { url: pdfUrl, createdAt: new Date() },
      { merge: true }
    );
    console.log("URL del PDF guardada en Firestore.");
  } catch (error) {
    console.error("Error al guardar la URL del PDF en Firestore:", error);
    throw error;
  }
};

// **Añadir Reflexión a una Entrada**
export const addReflexion = async (userId, entradaId, texto) => {
  try {
    const reflexionesCollection = collection(
      db,
      "entradas",
      entradaId,
      "reflexiones"
    );
    const newReflexion = {
      texto,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(reflexionesCollection, newReflexion);
    console.log("Reflexión añadida con ID:", docRef.id);
    return { id: docRef.id, ...newReflexion };
  } catch (error) {
    console.error("Error al añadir reflexión:", error);
    throw error;
  }
};

export const getDespedidasForUser = async (userId) => {
  try {
    const despedidasCollection = collection(db, "despedidas");
    const q = query(despedidasCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const despedidas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return despedidas;
  } catch (error) {
    console.error("Error al obtener despedidas propias:", error);
    throw error;
  }
};

/**
 * Obtener despedidas asignadas al usuario a través de beneficiarios
 * @param {string} email - Email del usuario
 * @returns {Array} - Lista de despedidas asignadas
 */
export const getDespedidasAssignedToUser = async (email) => {
  try {
    const despedidasRef = collection(db, "despedidas");
    const q = query(despedidasRef, where("beneficiarioEmails", "array-contains", email));
    const querySnapshot = await getDocs(q);
    const despedidas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return despedidas;
  } catch (error) {
    console.error("Error al obtener despedidas asignadas:", error);
    throw error;
  }
};
/**
 * Obtener beneficiarios de un usuario
 * @param {string} userId - UID del usuario
 * @returns {Array} - Lista de beneficiarios (emails)
 */
export const getBeneficiariosForUser = async (userId) => {
  try {
    const beneficiariosCollection = collection(db, "beneficiarios");
    const q = query(beneficiariosCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const beneficiarios = snapshot.docs.map((doc) => doc.data().email);
    return beneficiarios;
  } catch (error) {
    console.error("Error al obtener beneficiarios:", error);
    throw error;
  }
};

/**
 * Obtener un usuario por su email
 * @param {string} email - Email del usuario
 * @returns {Array|null} - Lista de usuarios o null si no existe
 */
export const getUserByEmail = async (email) => {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("No se encontró ningún usuario con el email proporcionado.");
      return null;
    }
    const userData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return userData;
  } catch (error) {
    console.error("Error al obtener usuario por email:", error);
    throw error;
  }
};

/**
 * Obtener un usuario por su userId
 * @param {string} userId - UID del usuario
 * @returns {Object|null} - Datos del usuario o null si no existe
 */
export const getUserByIdFromFirestore = async (userId) => {
  try {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where("__name__", "==", userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      console.log("No se encontró ningún usuario con el userId proporcionado.");
      return null;
    }
    const userData = snapshot.docs[0].data();
    return userData;
  } catch (error) {
    console.error("Error al obtener usuario por userId:", error);
    throw error;
  }
};

// firebase.js

/**
 * Obtener usuarios por una lista de UIDs
 * @param {Array} userIds - Array de UIDs de usuarios
 * @returns {Array} - Lista de usuarios con sus datos
 */
export const getUsersByIds = async (userIds) => {
  try {
    // Dividir el array de userIds en lotes de 10 (limitación de Firestore)
    const batches = [];
    while (userIds.length) {
      const batch = userIds.splice(0, 10);
      batches.push(batch);
    }

    const users = [];
    for (const batch of batches) {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("__name__", "in", batch));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
    }
    return users;
  } catch (error) {
    console.error("Error al obtener usuarios por IDs:", error);
    throw error;
  }
};

export const getReflexionesForUser = async (userId, entradaId) => {
  try {
    const reflexionesCollection = collection(db, "entradas", entradaId, "reflexiones");
    const snapshot = await getDocs(reflexionesCollection);
    const reflexiones = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Asegurar que los campos necesarios existen y convertir Timestamp a Date
    const reflexionesFormateadas = reflexiones.map((reflexion) => ({
      texto: reflexion.texto || "",
      categoria: reflexion.categoria || "Reflexion", // Por defecto
      fecha: reflexion.fecha ? reflexion.fecha.toDate() : new Date(), // Convertir a Date
      userId: reflexion.userId || "",
    }));

    return reflexionesFormateadas;
  } catch (error) {
    console.error("Error al obtener reflexiones:", error);
    throw error;
  }
};



// Exportar auth, db y storage para su uso en otros componentes
export { auth, db, storage };
