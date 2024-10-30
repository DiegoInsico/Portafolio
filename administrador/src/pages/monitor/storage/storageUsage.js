import { useState, useEffect } from 'react';
import { getStorage, ref, listAll, getMetadata } from "firebase/storage"; // Importa Firebase Storage
import { Bar } from 'react-chartjs-2';
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Importa Firestore
import './storage.css'; // Importa estilos

const StorageUsage = () => {
  const [storageData, setStorageData] = useState({
    Imagen: 0,
    Video: 0,
    Audio: 0,
    Texto: 0,
  });
  const [filteredData, setFilteredData] = useState(storageData);
  const [activeFilter, setActiveFilter] = useState("Todos");

  useEffect(() => {
    const fetchStorageData = async () => {
      const storage = getStorage();
      const db = getFirestore(); // Inicializa Firestore
      const storageRef = ref(storage, '/'); // Ruta raíz para listar todas las carpetas

      try {
        // Consulta de archivos en Firebase Storage
        const fileList = await listAll(storageRef);
        let newStorageData = { Imagen: 0, Video: 0, Audio: 0, Texto: 0 };

        // Recorre todas las carpetas
        for (let folder of fileList.prefixes) {
          const folderRef = ref(storage, folder.fullPath);
          const folderList = await listAll(folderRef);

          // Recorre todos los archivos dentro de cada carpeta
          for (let file of folderList.items) {
            const metadata = await getMetadata(file);
            const contentType = metadata.contentType; // Tipo MIME

            if (contentType.startsWith('image/')) {
              newStorageData.Imagen += 1;
            } else if (contentType.startsWith('video/')) {
              newStorageData.Video += 1;
            } else if (contentType.startsWith('audio/') || contentType === 'application/ogg') { 
              // Agregar 'application/ogg' o cualquier otro tipo si los audios son de un formato diferente
              newStorageData.Audio += 1;
            } else if (contentType === 'text/plain') {
              newStorageData.Texto += 1;
            }
          }
        }

        // Consulta en Firestore para contar los textos
        const entriesCollection = collection(db, "entradas"); // Cambia "entradas" por el nombre de tu colección
        const entriesSnapshot = await getDocs(entriesCollection);
        
        // Filtra los documentos que tienen el campo 'texto'
        const textEntriesCount = entriesSnapshot.docs.filter(doc => doc.data().texto).length;
        newStorageData.Texto = textEntriesCount; // Asigna el conteo de textos

        setStorageData(newStorageData);
        setFilteredData(newStorageData);
      } catch (error) {
        console.error("Error al obtener los archivos o textos de Firebase:", error.message);
      }
    };

    fetchStorageData();
  }, []);

  const handleFilter = (type) => {
    setActiveFilter(type);
    if (type === "Todos") {
      setFilteredData(storageData);
    } else {
      setFilteredData({
        Imagen: type === "Imagen" ? storageData.Imagen : 0,
        Video: type === "Video" ? storageData.Video : 0,
        Audio: type === "Audio" ? storageData.Audio : 0,
        Texto: type === "Texto" ? storageData.Texto : 0,
      });
    }
  };

  const chartData = {
    labels: ['Imagen', 'Video', 'Audio', 'Texto'],
    datasets: [
      {
        label: 'Cantidad de Archivos',
        data: [filteredData.Imagen, filteredData.Video, filteredData.Audio, filteredData.Texto],
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="storage-container">
      <h2>Uso de Almacenamiento por Tipo de Archivo</h2>
      
      {/* Botones de filtro */}
      <div className="filter-buttons">
        {["Todos", "Imagen", "Video", "Audio", "Texto"].map((type) => (
          <button
            key={type}
            className={`filter-button ${activeFilter === type ? 'active' : ''}`}
            onClick={() => handleFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <Bar data={chartData} />

      {/* Tabla de Información */}
      <div className="file-info-table">
        <h3>Información de Archivos</h3>
        <table>
          <thead>
            <tr>
              <th>Tipo de Archivo</th>
              <th>Cantidad</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Imágenes</td>
              <td>{storageData.Imagen}</td>
              <td>{storageData.Imagen} imágenes subidas</td>
            </tr>
            <tr>
              <td>Videos</td>
              <td>{storageData.Video}</td>
              <td>{storageData.Video} videos subidos</td>
            </tr>
            <tr>
              <td>Textos</td>
              <td>{storageData.Texto}</td>
              <td>{storageData.Texto} entradas creadas</td>
            </tr>
            <tr>
              <td>Audios</td>
              <td>{storageData.Audio}</td>
              <td>{storageData.Audio} audios subidos</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StorageUsage;
