// src/components/HastaPronto/HastaPronto.js

import React, { useState, useEffect, useRef } from "react";
import "./HastaPronto.css";
import {
  getDespedidasForUser,
  getDespedidasAssignedToUser,
  getUsersByIds,
} from "../../firebase";
import { useAuth } from "../../page/auth/authContext";
import ReactPlayer from "react-player";
import { motion } from "framer-motion";

const HastaPronto = ({ tipo }) => {
  const { currentUser } = useAuth();
  const [despedidas, setDespedidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [senders, setSenders] = useState({});
  const [selectedSender, setSelectedSender] = useState("");
  const [selectedDespedida, setSelectedDespedida] = useState(null);

  // Refs para animaciones
  const infoRef = useRef(null);
  const despedidasRef = useRef(null);
  const senderListRef = useRef(null);

  // Función para obtener las despedidas
  useEffect(() => {
    const fetchDespedidas = async () => {
      if (!currentUser) {
        setError("Usuario no autenticado.");
        setLoading(false);
        return;
      }
      try {
        let despedidasObtenidas = [];
        if (tipo === "mis-despedidas") {
          despedidasObtenidas = await getDespedidasForUser(currentUser.uid);
        } else if (tipo === "despedidas-asignadas") {
          despedidasObtenidas = await getDespedidasAssignedToUser(currentUser.email);
        }
        setDespedidas(despedidasObtenidas);

        // Extraer todos los userIds únicos de los remitentes
        const uniqueSenderIds = [
          ...new Set(
            despedidasObtenidas.map((despedida) => despedida.userId)
          ),
        ];

        // Obtener información de los remitentes
        const sendersData = await getUsersByIds([...uniqueSenderIds]);

        // Crear un mapa de userId a datos del remitente
        const sendersMap = {};
        sendersData.forEach((sender) => {
          sendersMap[sender.id] = {
            id: sender.id,
            email: sender.email,
            displayName: sender.displayName || sender.email,
          };
        });
        setSenders(sendersMap);
      } catch (err) {
        console.error("Error al obtener despedidas:", err);
        setError("Error al obtener las despedidas.");
      } finally {
        setLoading(false);
      }
    };

    fetchDespedidas();
  }, [currentUser, tipo]);

  // Crear la lista de remitentes
  const senderList = Object.values(senders);

  // Manejar la selección de una despedida
  const handleDespedidaSelect = (despedida) => {
    setSelectedDespedida(despedida);
  };

  // Función para manejar la selección de un remitente y establecer la despedida correspondiente
  const handleSenderClick = (senderId) => {
    setSelectedSender(senderId);
    // Encontrar la despedida asociada a este remitente
    const despedida = despedidas.find((d) => d.userId === senderId);
    if (despedida) {
      handleDespedidaSelect(despedida);
    } else {
      setSelectedDespedida(null);
    }
  };

  return (
    <div className="hp-scroll-container">
      {/* Hero Section */}
      <section className="hp-section">
        <div className="hp-hero-section">
          <div className="hp-hero-section-left">
            <h1>Hasta</h1>
            <h1>Pronto</h1>
          </div>
          <div className="hp-hero-section-right">
            <p>
              Visualiza tus despedidas o las que han sido asignadas a ti,
              recordando momentos especiales.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Condicional de Remitentes */}
      {tipo === "despedidas-asignadas" && despedidas.length > 0 && (
        <section
          className="hp-section hp-sender-list-section"
          ref={senderListRef}
        >
          <div className="hp-sender-list-container">
            <h2>Selecciona el remitente de la despedida</h2>
            <ul className="hp-sender-list">
              {senderList.map((sender) => (
                <li
                  key={sender.id}
                  className={`hp-sender-item-button ${
                    selectedSender === sender.id ? "selected" : ""
                  }`}
                  onClick={() => handleSenderClick(sender.id)}
                >
                  {sender.displayName}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Sección "Mis Despedidas" */}
      {tipo === "mis-despedidas" && despedidas.length > 0 && (
        <section
          className="hp-section hp-mis-despedidas-section"
          ref={despedidasRef}
        >
          <h2 className="hp-section-title">Mis Despedidas</h2>
          {loading ? (
            <p className="hp-loading">Cargando despedidas...</p>
          ) : error ? (
            <p className="hp-error">{error}</p>
          ) : despedidas.length === 0 ? (
            <p className="hp-no-despedidas">No hay despedidas para mostrar.</p>
          ) : (
            // Mostrar solo la primera despedida
            <div className="hp-despedida-contenido">
              {/* Video */}
              {despedidas[0].videoURL ? (
                <div className="hp-video-container-mis">
                  <ReactPlayer
                    url={despedidas[0].videoURL}
                    controls
                    width="100%"
                    height="100%"
                    className="hp-react-player"
                  />
                </div>
              ) : (
                <p className="hp-no-video">No hay video asociado.</p>
              )}
              {/* Mensaje */}
              <div className="hp-mensaje-container-mis">
                <p className="hp-mensaje-texto-mis">
                  "{despedidas[0].message}"
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sección de Información del Usuario y Mensaje Espiritual */}
      {selectedDespedida && (
        <section className="hp-section hp-info-section" ref={infoRef}>
          <div className="hp-info-content">
            {/* Mensaje Espiritual Título */}
            <motion.div
              className="hp-mensaje-titulo"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
            >
              <p>Tengo un mensaje para ustedes:</p>
            </motion.div>
            {/* Contenedor de Video y Mensaje en Dos Columnas */}
            <motion.div
              className="hp-contenido-dos-columnas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* Video */}
              {selectedDespedida.videoURL && (
                <div className="hp-video-container">
                  <ReactPlayer
                    url={selectedDespedida.videoURL}
                    controls
                    width="100%"
                    height="100%"
                    className="hp-react-player"
                  />
                </div>
              )}
              {/* Mensaje */}
              <div className="hp-mensaje-container">
                <p className="hp-mensaje-texto">
                  "{selectedDespedida.message}"
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HastaPronto;
