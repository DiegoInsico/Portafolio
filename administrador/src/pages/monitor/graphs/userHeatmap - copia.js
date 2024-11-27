import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import axios from "axios";

const UserHeatmap = () => {
  const [locations, setLocations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null); // Usuario seleccionado
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    categorias: [],
    emociones: [],
  });

  // Función para obtener las categorías y emociones más frecuentes
  const getMostFrequent = (data) => {
    if (!data || data.length === 0) return [];
    const counts = data.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const maxCount = Math.max(...Object.values(counts));
    return Object.keys(counts).filter((key) => counts[key] === maxCount);
  };

  const FitMapBounds = ({ locations }) => {
    const map = useMap();
    useEffect(() => {
      if (locations.length > 0) {
        const bounds = locations.map(({ lat, lng }) => [lat, lng]);
        map.fitBounds(bounds);
      }
    }, [locations, map]);
    return null;
  };

  // Cargar coordenadas iniciales desde "users"
  useEffect(() => {
    const fetchUserCoordinates = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const locationsData = [];

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          if (userData.ciudad && userData.pais && userData.comuna) {
            console.log(`Procesando usuario: ${userDoc.id}, comuna: ${userData.comuna}`);
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${userData.ciudad},${userData.pais},${userData.comuna}&key=84862a94e7a14334b64d6acd4b16fb59`
            );

            const results = response.data.results;
            if (results && results.length > 0) {
              const { lat, lng } = results[0].geometry;

              locationsData.push({
                lat,
                lng,
                userId: userDoc.id,
              });
            } else {
              console.warn(`No se encontraron coordenadas para el usuario: ${userDoc.id}`);
            }
          } else {
            console.warn(`Faltan datos de ubicación para el usuario: ${userDoc.id}`);
          }
        }

        setLocations(locationsData);
      } catch (error) {
        console.error("Error al cargar las coordenadas de los usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCoordinates();
  }, []);

  // Cargar categorías y emociones desde "entradas" al seleccionar un usuario
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUserId) return;

      try {
        console.log(`Cargando detalles para el usuario: ${selectedUserId}`);
        const entradasSnapshot = await getDocs(collection(db, "entradas"));
        const categorias = [];
        const emociones = [];

        entradasSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.userId === selectedUserId) {
            console.log(`Entrada coincide con el usuario ${selectedUserId}:`, data);
            if (data.categoria) categorias.push(data.categoria);
            if (data.emociones && Array.isArray(data.emociones)) {
              emociones.push(...data.emociones);
            }
          }
        });

        const mostFrequentCategorias = getMostFrequent(categorias);
        const mostFrequentEmociones = getMostFrequent(emociones);

        console.log(`Categorías más usadas para el usuario ${selectedUserId}:`, mostFrequentCategorias);
        console.log(`Emociones más usadas para el usuario ${selectedUserId}:`, mostFrequentEmociones);

        setUserDetails({
          categorias: mostFrequentCategorias,
          emociones: mostFrequentEmociones,
        });
      } catch (error) {
        console.error("Error al cargar detalles del usuario:", error);
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  if (loading) {
    return <p>Cargando mapa...</p>;
  }

  if (locations.length === 0) {
    return <p>No hay datos para mostrar en el mapa.</p>;
  }

  return (
    <div
      className="map-container"
      style={{
        marginLeft: "20%",
        marginTop: "5%",
        height: "400px",
        width: "60%",
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitMapBounds locations={locations} />
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            eventHandlers={{
              click: () => {
                console.log(`Marcador clicado para usuario: ${location.userId}`);
                setSelectedUserId(location.userId);
              },
            }}
          >
            <Popup>
              <div>
                <h3>Detalles del Usuario</h3>
                <p>
                  <strong>User ID:</strong> {location.userId}
                </p>
                <p>
                  <strong>Categorías Más Usadas:</strong>{" "}
                  {userDetails.categorias.length > 0
                    ? userDetails.categorias.join(", ")
                    : "Desconocidas"}
                </p>
                <p>
                  <strong>Emociones Más Usadas:</strong>{" "}
                  {userDetails.emociones.length > 0
                    ? userDetails.emociones.join(", ")
                    : "No especificadas"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default UserHeatmap;
