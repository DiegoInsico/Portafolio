import { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { fetchStorageData } from "./storageData";
import Container from "../../../components/container";
import "./storage.css";

const StorageUsage = () => {
  const [storageData, setStorageData] = useState({ Imagen: 0, Video: 0, Audio: 0, Texto: 0 });
  const [filteredData, setFilteredData] = useState(storageData);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchStorageData();
        setStorageData(data);
        setFilteredData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    loadData();
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
    labels: ["Imagen", "Video", "Audio", "Texto"],
    datasets: [
      {
        label: "Cantidad de Archivos",
        data: [
          filteredData.Imagen,
          filteredData.Video,
          filteredData.Audio,
          filteredData.Texto,
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"],
        borderColor: ["#36A2EB", "#FF6384", "#4BC0C0", "#9966FF"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container>
      <div className="storage-container">
        <h2>Uso de Almacenamiento por Tipo de Archivo</h2>

        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="filter-buttons">
              {["Todos", "Imagen", "Video", "Audio", "Texto"].map((type) => (
                <button
                  key={type}
                  className={`filter-button ${activeFilter === type ? "active" : ""}`}
                  onClick={() => handleFilter(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <Bar data={chartData} />

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
                  {Object.keys(storageData).map((key) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{storageData[key]}</td>
                      <td>{`${storageData[key]} ${key.toLowerCase()} subidos`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default StorageUsage;
