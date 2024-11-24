import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import axios from "axios";

const Heatmap = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      const validPoints = points.filter((point) => point.lat && point.lng);

      if (validPoints.length > 0) {
        // Crear capa de calor
        const heatLayer = window.L.heatLayer(
          validPoints.map(({ lat, lng }) => [lat, lng, 1]), // Coordenadas
          {
            radius: 25,
            blur: 15,
            maxZoom: 17,
          }
        );

        heatLayer.addTo(map);

        // Crear marcadores interactivos
        validPoints.forEach(({ lat, lng, emociones, categoria, color }) => {
          const marker = window.L.circleMarker([lat, lng], {
            radius: 10,
            color: color || "transparent",
            fillColor: color || "rgba(255, 255, 255, 0.5)",
            fillOpacity: 0.7,
          });

          marker
            .on("mouseover", () => {
              marker.setStyle({
                color: "#FF0000",
                fillColor: "#FF0000",
                fillOpacity: 0.9,
              }); // Resaltar
              const popup = window.L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                  <strong>Categoría:</strong> ${categoria || "Desconocida"}<br>
                  <strong>Emociones:</strong> ${emociones.join(", ")}
                `) // Mostrar categoría y emociones
                .openOn(map);
            })
            .on("mouseout", () => {
              marker.setStyle({
                color: color || "transparent",
                fillColor: color || "rgba(255, 255, 255, 0.5)",
                fillOpacity: 0.7,
              });
              map.closePopup();
            });

          marker.addTo(map);
        });

        // Centrar el mapa solo si hay puntos válidos
        const bounds = window.L.latLngBounds(
          validPoints.map(({ lat, lng }) => [lat, lng])
        );
        map.fitBounds(bounds);
      }
    }
  }, [points, map]);

  return null;
};

const UserHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const locations = [];

        for (const doc of snapshot.docs) {
          const userData = doc.data();
          if (userData.city && userData.country) {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${userData.city},${userData.country}&key=84862a94e7a14334b64d6acd4b16fb59`
            );

            const results = response.data.results;
            if (results && results.length > 0) {
              const { lat, lng } = results[0].geometry;
              locations.push({
                lat,
                lng,
                emociones: userData.emociones || ["No especificado"],
                categoria: userData.categoria || "Desconocida",
                color: userData.color || null,
              });
            }
          }
        }

        setHeatmapData(locations);
      } catch (error) {
        console.error("Error al cargar ubicaciones de usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocations();
  }, []);

  if (loading) {
    return <p>Cargando mapa...</p>;
  }

  if (heatmapData.length === 0) {
    return <p>No hay datos para mostrar en el mapa de calor.</p>;
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
        <Heatmap points={heatmapData} />
      </MapContainer>
    </div>
  );
};

export default UserHeatmap;
