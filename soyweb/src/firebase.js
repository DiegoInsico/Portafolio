// src/firebase.js

import { initializeApp } from "firebase/app";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, signOut as firebaseSignOut,
} from "firebase/auth";
import {
  getFirestore, collection, getDocs, query, where, Timestamp, addDoc, doc, updateDoc, onSnapshot, deleteDoc, getDoc, setDoc, arrayUnion, serverTimestamp, runTransaction
} from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";

const DEFAULT_THUMBNAIL_URL = "https://via.placeholder.com/150";

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

const firestore = getFirestore(app);
export const auth = getAuth(app); // Exporta auth
export const db = getFirestore(app); // Exporta db
export const storage = getStorage(app); // Exporta storage


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

// Función para obtener una entrada específica por ID
export const getEntradaById = async (entryId) => {
  try {
    const entryDocRef = doc(db, 'entradas', entryId);
    const entryDoc = await getDoc(entryDocRef);
    if (entryDoc.exists()) {
      return { id: entryDoc.id, ...entryDoc.data() };
    } else {
      console.warn(`Entrada con ID ${entryId} no encontrada.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching entrada with ID ${entryId}:`, error);
    throw error;
  }
};

// Función para obtener múltiples entradas por IDs
export const getEntradasByIds = async (entryIds) => {
  try {
    const entriesPromises = entryIds.map(entryId => getEntradaById(entryId));
    const entries = await Promise.all(entriesPromises);
    // Filtrar entradas no encontradas
    return entries.filter(entry => entry !== null);
  } catch (error) {
    console.error("Error fetching entradas by IDs:", error);
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
  }
}

// Añadir entrada al collage
export const addEntryToCollage = async (collageId, entryId, initialPosition = { x: 100, y: 100 }) => {
  console.log(`// DEBUG [addEntryToCollage]: Iniciando función con collageId=${collageId}, entryId=${entryId}, initialPosition=`, initialPosition);
  try {
    console.log("// DEBUG [addEntryToCollage]: Obteniendo referencia al documento del collage...");
    const collageRef = doc(db, "collages", collageId);

    console.log("// DEBUG [addEntryToCollage]: Actualizando documento con nueva entrada...");
    await updateDoc(collageRef, {
      entries: arrayUnion({
        entryId,
        position: initialPosition,
        size: { width: 300, height: 400 },
        backgroundColor: '#ffffff'
      }),
    });
    console.log(`// DEBUG [addEntryToCollage]: Entrada ${entryId} agregada exitosamente al collage ${collageId}.`);
  } catch (error) {
    console.error("// DEBUG [addEntryToCollage]: Error agregando la entrada al collage:", error);
    throw error;
  }
};


// Suscribirse a los collages de un usuario
export const subscribeToCollages = (userId, onUpdate, onError) => {
  console.log(`// DEBUG [subscribeToCollages]: Iniciando suscripción a collages del usuario userId=${userId}`);
  const db = getFirestore();
  const collagesRef = collection(db, 'collages');
  const q = query(collagesRef, where('userId', '==', userId));

  console.log("// DEBUG [subscribeToCollages]: Configurando onSnapshot para monitorear cambios...");
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      console.log(`// DEBUG [subscribeToCollages]: Snapshot recibido para userId=${userId}. Cantidad de documentos: ${snapshot.size}`);
      const collages = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        thumbnail: doc.data().thumbnail || DEFAULT_THUMBNAIL_URL,
        entries: doc.data().entries || [],
        createdAt: doc.data().createdAt,
        userId: doc.data().userId,
        titleData: doc.data().titleData || {} // <-- Agregar este campo
      }));
      console.log("// DEBUG [subscribeToCollages]: Collages actualizados:", collages);
      onUpdate(collages);
    },
    (error) => {
      console.error('// DEBUG [subscribeToCollages]: Error en la suscripción a collages:', error);
      onError(error);
    }
  );

  return unsubscribe;
};


// Crear un nuevo collage
export const createCollageAlbum = async (collageName, selectedEntries, thumbnail, currentUser, titleData) => {
  console.log(`// DEBUG [createCollageAlbum]: Iniciando creación de collage. Nombre=${collageName}, selectedEntries=`, selectedEntries, "titleData=", titleData);
  try {
    if (!currentUser || !currentUser.uid) {
      console.error('// DEBUG [createCollageAlbum]: User ID no definido');
      throw new Error('User ID is undefined');
    }

    console.log('// DEBUG [createCollageAlbum]: Subiendo thumbnail a Firebase Storage...');
    const uniqueThumbnailName = `thumbnails/${uuidv4()}-${thumbnail.name}`;
    const thumbnailRef = ref(storage, uniqueThumbnailName);
    await uploadBytes(thumbnailRef, thumbnail);
    const thumbnailURL = await getDownloadURL(thumbnailRef);
    console.log('// DEBUG [createCollageAlbum]: Thumbnail subida con URL:', thumbnailURL);

    const newCollageRef = doc(collection(db, 'collages'));
    console.log('// DEBUG [createCollageAlbum]: Creando documento del collage en Firestore con ID:', newCollageRef.id);
    await setDoc(newCollageRef, {
      name: collageName,
      thumbnail: thumbnailURL,
      thumbnailPath: uniqueThumbnailName,
      createdAt: serverTimestamp(),
      userId: currentUser.uid,
      entries: selectedEntries,
      titleData: titleData
    });

    console.log(`// DEBUG [createCollageAlbum]: Collage creado exitosamente con ID ${newCollageRef.id}`);
    return newCollageRef.id;
  } catch (error) {
    console.error('// DEBUG [createCollageAlbum]: Error al crear el collage:', error);
    throw error;
  }
};


// Obtener collages por usuario
export const getCollagesByUser = async (userId) => {
  console.log(`// DEBUG [getCollagesByUser]: Iniciando fetch de collages para userId=${userId}`);
  try {
    const collagesCollection = collection(db, "collages");
    const q = query(collagesCollection, where("userId", "==", userId));
    console.log("// DEBUG [getCollagesByUser]: Ejecutando consulta en Firestore...");
    const snapshot = await getDocs(q);

    console.log(`// DEBUG [getCollagesByUser]: Número de collages obtenidos: ${snapshot.size}`);

    const collages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        thumbnail: data.thumbnail || DEFAULT_THUMBNAIL_URL,
        entries: data.entries || [],
      };
    });

    console.log("// DEBUG [getCollagesByUser]: Datos de collages obtenidos:", collages);
    return collages;
  } catch (error) {
    console.error("// DEBUG [getCollagesByUser]: Error al obtener collages:", error);
    throw error;
  }
};


// Obtener un collage específico por ID
export const getCollageById = async (collageId) => {
  console.log(`// DEBUG [getCollageById]: Obteniendo collage con ID=${collageId}`);
  try {
    const collageRef = doc(db, "collages", collageId);
    const collageDoc = await getDoc(collageRef);

    if (collageDoc.exists()) {
      const data = collageDoc.data();
      const collageData = {
        id: collageDoc.id,
        name: data.name,
        thumbnail: data.thumbnail || DEFAULT_THUMBNAIL_URL,
        entries: data.entries || [],
        createdAt: data.createdAt,
        userId: data.userId,
        titleData: data.titleData // <- Agregar este campo
      };
      console.log("// DEBUG [getCollageById]: Collage encontrado:", collageData);
      return collageData;
    } else {
      console.warn("// DEBUG [getCollageById]: Collage no encontrado");
      return null;
    }
  } catch (error) {
    console.error("// DEBUG [getCollageById]: Error fetching collage:", error);
    throw error;
  }
};

// Actualizar posición de una entrada en el collage
export const updateEntryPositionInCollage = async (collageId, entryId, newPosition) => {
  console.log(`// DEBUG [updateEntryPositionInCollage]: Iniciando actualización de posición. collageId=${collageId}, entryId=${entryId}, newPosition=`, newPosition);
  try {
    const collageRef = doc(db, "collages", collageId);

    await runTransaction(db, async (transaction) => {
      console.log("// DEBUG [updateEntryPositionInCollage]: Iniciando transacción de Firestore...");
      const collageDoc = await transaction.get(collageRef);
      if (!collageDoc.exists()) {
        console.error("// DEBUG [updateEntryPositionInCollage]: Collage no encontrado");
        throw new Error("Collage no encontrado");
      }

      const entries = collageDoc.data().entries || [];
      const updatedEntries = entries.map(entry => {
        if (entry.entryId === entryId) {
          console.log(`// DEBUG [updateEntryPositionInCollage]: Actualizando posición de entryId=${entryId}`);
          return { ...entry, position: newPosition };
        }
        return entry;
      });

      console.log("// DEBUG [updateEntryPositionInCollage]: Actualizando documento con nuevas posiciones...");
      transaction.update(collageRef, { entries: updatedEntries });
    });
    console.log("// DEBUG [updateEntryPositionInCollage]: Posición actualizada exitosamente.");

  } catch (error) {
    console.error("// DEBUG [updateEntryPositionInCollage]: Error actualizando posición de la entrada:", error);
    throw error;
  }
};


// Actualizar propiedades del título del collage
export const updateCollageTitleProperties = async (collageId, properties) => {
  console.log(`// DEBUG [updateCollageTitleProperties]: Actualizando propiedades del título para collageId=${collageId}, properties=`, properties);
  try {
    const collageRef = doc(db, "collages", collageId);
    const collageDoc = await getDoc(collageRef);
    if (!collageDoc.exists()) {
      console.error("// DEBUG [updateCollageTitleProperties]: Collage no encontrado");
      throw new Error("Collage no encontrado");
    }

    await updateDoc(collageRef, { ...properties });
    console.log("// DEBUG [updateCollageTitleProperties]: Propiedades del título actualizadas exitosamente.");
  } catch (error) {
    console.error("// DEBUG [updateCollageTitleProperties]: Error actualizando propiedades del título:", error);
    throw error;
  }
};

// Remover una entrada del collage
export const removeEntryFromCollage = async (collageId, entryId) => {
  console.log(`// DEBUG [removeEntryFromCollage]: Iniciando la remoción de entryId=${entryId} del collageId=${collageId}`);
  const firestore = getFirestore();
  try {
    const collageRef = doc(firestore, "collages", collageId);
    const collageDoc = await getDoc(collageRef);

    if (!collageDoc.exists()) {
      console.error("// DEBUG [removeEntryFromCollage]: Collage no encontrado");
      throw new Error("Collage no encontrado");
    }

    const existingEntries = collageDoc.data().entries || [];
    const entryToRemove = existingEntries.find(entry => entry.entryId === entryId);

    if (!entryToRemove) {
      console.warn(`// DEBUG [removeEntryFromCollage]: La entrada entryId=${entryId} no existe en el collage`);
      return;
    }

    const updatedEntries = existingEntries.filter(entry => entry.entryId !== entryId);
    console.log(`// DEBUG [removeEntryFromCollage]: Removiendo entryId=${entryId}. Entradas antes: ${existingEntries.length}, después: ${updatedEntries.length}`);
    await updateDoc(collageRef, { entries: updatedEntries });
    console.log(`// DEBUG [removeEntryFromCollage]: Entrada entryId=${entryId} removida exitosamente del collageId=${collageId}`);
  } catch (error) {
    console.error("// DEBUG [removeEntryFromCollage]: Error al remover la entrada del collage:", error);
    throw error;
  }
};


// Eliminar un collage y sus recursos asociados
export const deleteCollage = async (collageId) => {
  console.log(`// DEBUG [deleteCollage]: Iniciando eliminación del collageId=${collageId}`);
  const storage = getStorage();
  const firestore = getFirestore();
  const collageDocRef = doc(firestore, 'collages', collageId);

  try {
    const docSnapshot = await getDoc(collageDocRef);

    if (docSnapshot.exists()) {
      const collageData = docSnapshot.data();
      console.log("// DEBUG [deleteCollage]: Collage encontrado, iniciando eliminación de recursos...");

      // Eliminar miniatura del collage
      if (collageData.thumbnailPath) {
        const thumbnailRef = ref(storage, collageData.thumbnailPath);
        console.log(`// DEBUG [deleteCollage]: Intentando eliminar miniatura en ${collageData.thumbnailPath}`);
        try {
          await getMetadata(thumbnailRef);
          await deleteObject(thumbnailRef);
          console.log(`// DEBUG [deleteCollage]: Miniatura del collage eliminada del Storage`);
        } catch (error) {
          if (error.code === 'storage/object-not-found') {
            console.log(`// DEBUG [deleteCollage]: La miniatura ${collageData.thumbnailPath} no existe en el Storage.`);
          } else {
            console.error("// DEBUG [deleteCollage]: Error eliminando miniatura del collage:", error);
            throw error;
          }
        }
      }

      // Eliminar miniaturas de las entradas
      if (collageData.entries && Array.isArray(collageData.entries)) {
        for (const entry of collageData.entries) {
          if (entry.thumbnail) {
            const entryThumbnailRef = ref(storage, entry.thumbnail);
            console.log(`// DEBUG [deleteCollage]: Eliminando miniatura de entrada entryId=${entry.entryId}`);
            try {
              await getMetadata(entryThumbnailRef);
              await deleteObject(entryThumbnailRef);
              console.log(`// DEBUG [deleteCollage]: Miniatura de entrada ${entry.entryId} eliminada`);
            } catch (error) {
              if (error.code === 'storage/object-not-found') {
                console.log(`// DEBUG [deleteCollage]: La miniatura de la entrada ${entry.entryId} ya no existe.`);
              } else {
                console.error(`// DEBUG [deleteCollage]: Error eliminando miniatura de entrada ${entry.entryId}:`, error);
                throw error;
              }
            }
          }
        }
      }

      // Eliminar el documento del collage en Firestore
      console.log("// DEBUG [deleteCollage]: Eliminando documento del collage en Firestore...");
      await deleteDoc(collageDocRef);
      console.log("// DEBUG [deleteCollage]: Collage eliminado exitosamente de Firestore");
    } else {
      console.log("// DEBUG [deleteCollage]: El collage no existe en Firestore");
    }

  } catch (error) {
    console.error("// DEBUG [deleteCollage]: Error eliminando el collage:", error);
    throw error;
  }
};

// Actualizar propiedades de una entrada en el collage
export const updateEntryProperties = async (collageId, entryId, properties) => {
  console.log(`// DEBUG [updateEntryProperties]: Iniciando actualización de propiedades de entrada. collageId=${collageId}, entryId=${entryId}, properties=`, properties);

  try {
    const collageRef = doc(db, "collages", collageId);
    const collageDoc = await getDoc(collageRef);
    if (!collageDoc.exists()) {
      console.error("// DEBUG [updateEntryProperties]: Collage no encontrado");
      throw new Error("Collage no encontrado");
    }

    const entries = collageDoc.data().entries || [];
    let entryFound = false;
    const updatedEntries = entries.map(entry => {
      if (entry.entryId === entryId) {
        entryFound = true;
        console.log(`// DEBUG [updateEntryProperties]: Actualizando propiedades de entryId=${entryId}`);
        return { ...entry, ...properties };
      }
      return entry;
    });

    if (!entryFound) {
      console.warn(`// DEBUG [updateEntryProperties]: No se encontró la entrada con entryId=${entryId} en el collage.`);
    }

    await updateDoc(collageRef, { entries: updatedEntries });
    console.log(`// DEBUG [updateEntryProperties]: Propiedades actualizadas exitosamente para entryId=${entryId}`);
  } catch (error) {
    console.error("// DEBUG [updateEntryProperties]: Error actualizando propiedades de la entrada:", error);
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
    const q = query(
      despedidasRef,
      where("beneficiarioEmails", "array-contains", email)
    );
    const querySnapshot = await getDocs(q);
    const despedidas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
    const userData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
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
// Función para obtener datos del usuario por UID
export const getUserByIdFromFirestore = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log("No existe el documento del usuario.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el documento del usuario:", error);
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
    const reflexionesCollection = collection(
      db,
      "entradas",
      entradaId,
      "reflexiones"
    );
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
