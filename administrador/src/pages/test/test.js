import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref, getMetadata } from "firebase/storage";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import './test.css'

const db = getFirestore();
const storage = getStorage();

const Test = () => {
  const [userStorageData, setUserStorageData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener todas las entradas asociadas a un usuario
  const getEntriesByUser = async (userId) => {
    const entriesRef = collection(db, "entradas");
    const q = query(entriesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      media: doc.data().media,
      mediaType: doc.data().mediaType || "unknown", // Tipo de archivo
      audio: doc.data().audio,
      baul: doc.data().baul,
    }));
  };

  // Función para obtener el tamaño de un archivo desde Storage
  const getFileSize = async (filePath) => {
    try {
      const fileRef = ref(storage, filePath);
      const metadata = await getMetadata(fileRef);
      return metadata.size; // Tamaño en bytes
    } catch (error) {
      console.error("Error obteniendo el tamaño del archivo:", error);
      return 0;
    }
  };

  // Función para calcular el consumo de almacenamiento por usuario y tipo de archivo
  const calculateStorageUsageByUser = async () => {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);

    const userStorageUsage = [];
    let userIndex = 1; // Para asignar identificadores únicos a los usuarios

    for (const userDoc of querySnapshot.docs) {
      const userId = userDoc.id;
      const userName = `Usuario ${userIndex++}`;

      const entries = await getEntriesByUser(userId);
      const usageByType = {
        image: 0,
        video: 0,
        audio: 0,
        unknown: 0, // Para tipos no especificados
      };

      for (const entry of entries) {
        // Procesar cada atributo que puede referenciar datos en Storage
        const attributes = [
          { filePath: entry.media, type: entry.mediaType || "unknown" },
          { filePath: entry.audio, type: "audio" },
          { filePath: entry.baul, type: "unknown" },
        ];

        for (const attr of attributes) {
          if (attr.filePath && typeof attr.filePath === "string") {
            const filePath = attr.filePath.split("/o/")[1]?.split("?")[0];
            if (filePath) {
              const size = await getFileSize(decodeURIComponent(filePath));
              usageByType[attr.type] += size; // Acumular por tipo
            }
          }
        }
      }

      userStorageUsage.push({
        userId,
        userName,
        totalSize: (
          Object.values(usageByType).reduce((a, b) => a + b, 0) /
          1024 /
          1024
        ).toFixed(2), // Convertir a MB
        usageByType: {
          image: (usageByType.image / 1024 / 1024).toFixed(2),
          video: (usageByType.video / 1024 / 1024).toFixed(2),
          audio: (usageByType.audio / 1024 / 1024).toFixed(2),
          unknown: (usageByType.unknown / 1024 / 1024).toFixed(2),
        },
      });
    }

    setUserStorageData(userStorageUsage);
    setLoading(false);
  };

  // Llamar a la función para calcular los datos cuando el componente se monta
  useEffect(() => {
    calculateStorageUsageByUser();
  }, []);

  // Datos para la gráfica
  const chartData = {
    labels: userStorageData.map((user) => user.userName),
    datasets: [
      {
        label: "Imágenes (MB)",
        data: userStorageData.map((user) => parseFloat(user.usageByType.image)),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Videos (MB)",
        data: userStorageData.map((user) => parseFloat(user.usageByType.video)),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Audios (MB)",
        data: userStorageData.map((user) => parseFloat(user.usageByType.audio)),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Desconocido (MB)",
        data: userStorageData.map((user) =>
          parseFloat(user.usageByType.unknown)
        ),
        backgroundColor: "rgba(201, 203, 207, 0.6)",
        borderColor: "rgba(201, 203, 207, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="pb-container">
      <h1 className="pb-title">Consumo de Almacenamiento por Usuario</h1>
      {loading ? (
        <p className="pb-loading">Cargando datos...</p>
      ) : (
        <>
          <div className="pb-chart-container">
            <Bar data={chartData} />
          </div>
          <div className="pb-table-container">
            <table className="pb-table">
              <thead className="pb-table-head">
                <tr className="pb-table-row">
                  <th className="pb-table-header">Usuario</th>
                  <th className="pb-table-header">Imágenes (MB)</th>
                  <th className="pb-table-header">Videos (MB)</th>
                  <th className="pb-table-header">Audios (MB)</th>
                  <th className="pb-table-header">Otros (MB)</th>
                  <th className="pb-table-header">Total (MB)</th>
                </tr>
              </thead>
              <tbody className="pb-table-body">
                {userStorageData.map((user) => (
                  <tr key={user.userId} className="pb-table-row">
                    <td className="pb-table-cell">{user.userName}</td>
                    <td className="pb-table-cell">{user.usageByType?.image || "0.00"}</td>
                    <td className="pb-table-cell">{user.usageByType?.video || "0.00"}</td>
                    <td className="pb-table-cell">{user.usageByType?.audio || "0.00"}</td>
                    <td className="pb-table-cell">{user.usageByType?.unknown || "0.00"}</td>
                    <td className="pb-table-cell">{user.totalSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
  
};

export default Test;
