import { getStorage, ref, listAll, getMetadata } from "firebase/storage";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export const fetchStorageData = async () => {
  const storage = getStorage();
  const db = getFirestore();
  const storageRef = ref(storage, "/");
  let storageData = { Imagen: 0, Video: 0, Audio: 0, Texto: 0 };

  try {
    const fileList = await listAll(storageRef);

    // Recorre todas las carpetas
    for (let folder of fileList.prefixes) {
      const folderRef = ref(storage, folder.fullPath);
      const folderList = await listAll(folderRef);

      // Recorre todos los archivos dentro de cada carpeta
      for (let file of folderList.items) {
        const metadata = await getMetadata(file);
        const contentType = metadata.contentType;

        if (contentType.startsWith("image/")) {
          storageData.Imagen += 1;
        } else if (contentType.startsWith("video/")) {
          storageData.Video += 1;
        } else if (contentType.startsWith("audio/") || contentType === "application/ogg") {
          storageData.Audio += 1;
        }
      }
    }

    // Consulta en Firestore para contar textos
    const entriesCollection = collection(db, "entradas");
    const entriesSnapshot = await getDocs(entriesCollection);
    const textEntriesCount = entriesSnapshot.docs.filter((doc) => doc.data().texto).length;

    storageData.Texto = textEntriesCount;
  } catch (error) {
    console.error("Error al obtener datos de Firebase:", error.message);
    throw new Error("Error al obtener los datos de almacenamiento.");
  }

  return storageData;
};
