// src/components/Mensajes.js

import React, { useState, useEffect, useRef } from "react";
import "./Mensajes.css";
import { getMensajesForUser, getUserById } from "../../firebase"; // Ajusta la ruta si es necesario
import { useAuth } from "../../page/auth/authContext";
import { motion } from "framer-motion";

const Mensajes = () => {
  const { currentUser } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [senders, setSenders] = useState({});
  const [selectedSender, setSelectedSender] = useState("");

  // Refs para animaciones
  const infoRef = useRef(null);
  const mensajesRef = useRef(null);
  const fragmentsRef = useRef(null);

  const fetchMensajes = async () => {
    if (!currentUser) {
      setError("Usuario no autenticado.");
      setLoading(false);
      return;
    }
    try {
      const mensajesObtenidos = await getMensajesForUser(currentUser.email);
      console.log("Mensajes obtenidos:", mensajesObtenidos);

      setMensajes(mensajesObtenidos);

      // Extraer todos los userIds únicos de los remitentes
      const uniqueSenderIds = [...new Set(mensajesObtenidos.map((mensaje) => mensaje.userId))];

      // Obtener los nombres de los remitentes
      const sendersCopy = { ...senders };
      for (const senderId of uniqueSenderIds) {
        if (senderId && !sendersCopy[senderId]) {
          const senderData = await getUserById(senderId);
          if (senderData && senderData.displayName) {
            sendersCopy[senderId] = senderData.displayName;
          } else {
            sendersCopy[senderId] = "Usuario desconocido";
          }
        }
      }
      setSenders(sendersCopy);
    } catch (err) {
      console.error("Error al obtener mensajes:", err);
      setError("Error al obtener los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Configurar Intersection Observer para animaciones
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("mns-animate");
          observer.unobserve(entry.target); // Deja de observar una vez animado
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, options);

    if (infoRef.current) {
      observer.observe(infoRef.current);
    }

    if (mensajesRef.current) {
      observer.observe(mensajesRef.current);
    }

    if (fragmentsRef.current) {
      observer.observe(fragmentsRef.current);
    }

    // Limpieza
    return () => {
      if (infoRef.current) observer.unobserve(infoRef.current);
      if (mensajesRef.current) observer.unobserve(mensajesRef.current);
      if (fragmentsRef.current) observer.unobserve(fragmentsRef.current);
    };
  }, []);

  // Crear la lista de remitentes
  const senderList = [...new Set(mensajes.map((m) => m.userId))].map((senderId) => ({
    userId: senderId,
    displayName: senders[senderId] || "Usuario desconocido",
  }));

  // Filtrar mensajes según el remitente seleccionado
  const mensajesFiltrados = selectedSender
    ? mensajes.filter((mensaje) => mensaje.userId === selectedSender)
    : [];

  return (
    <div className="mns-scroll-container-banner">
      {/* Hero Section */}
      <section className="mns-section">
        <div className="mns-page-one">
          <div className="mns-banner-content-left">
            <h1>Un Fragmento</h1>
            <h1>Para ti</h1>
          </div>
          <div className="mns-banner-content-right">
            <p>
              En este lugar le dejas un mensaje a tus seres queridos,
              para que siempre tengan una parte de ti presente en sus vidas.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Condicional de Remitentes */}
      {mensajes.length > 0 && (
        <section className="mns-section mns-sender-list-section">
          <div className="mns-sender-list-container">
            <h2>Selecciona el usuario que te envio un fragmento</h2>
            <ul className="mns-sender-list">
              {senderList.map((sender) => (
                <li
                  key={sender.userId}
                  className={`mns-sender-item-button ${
                    selectedSender === sender.userId ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSender(sender.userId)}
                >
                  {sender.displayName}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Información del Usuario */}
      <section className="mns-section mns-info-section" ref={infoRef}>
        <div className="mns-info-content">
          {selectedSender ? (
            <motion.p
              className="mns-info-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {senders[selectedSender]} tiene algo para ti,
              <br />
              un fragmento de su esencia,
              <br />
              de su Alma.
            </motion.p>
          ) : mensajes.length > 0 ? (
            <p className="mns-info-text">Selecciona un remitente para ver sus mensajes.</p>
          ) : (
            <p className="mns-info-text">No tienes mensajes aún.</p>
          )}
        </div>
      </section>

      {/* Mensajes Section */}
      <section className="mns-section mns-section-content" ref={mensajesRef}>
        <div className="mns-container">
          {loading ? (
            <p className="mns-loading">Cargando mensajes...</p>
          ) : error ? (
            <p className="mns-error">{error}</p>
          ) : mensajesFiltrados.length === 0 ? (
            <p className="mns-no-messages">No tienes mensajes de este remitente.</p>
          ) : (
            mensajesFiltrados.map((mensaje) => {
              const { media, mediaType, titulo, contenido, fechaEnvio, userId } = mensaje;
              const fechaFormateada = fechaEnvio
                ? new Date(mensaje.fechaEnvio.seconds * 1000).toLocaleString()
                : "Fecha desconocida";
              const senderName = senders[userId] || "Usuario desconocido";

              return (
                <div key={mensaje.id} className="mns-item">
                  {media && mediaType === "video" ? (
                    <div className="mns-video-container">
                      <video controls src={mensaje.media} className="mns-video" />
                    </div>
                  ) : (
                    <>
                      <div className="mns-media">
                        {media && mediaType === "imagen" ? (
                          <img
                            src={media}
                            alt={titulo || "Imagen del mensaje"}
                            className="mns-imagen"
                          />
                        ) : (
                          <p>No hay medios asociados.</p>
                        )}
                      </div>
                      <div className="mns-content">
                        <h3>{titulo || "Mensaje sin título"}</h3>
                        <p>{contenido || "Mensaje sin contenido"}</p>
                        <p className="mns-fecha-envio">
                          Enviado el: {fechaFormateada}
                        </p>
                        <p className="mns-sender">
                          Remitente: {senderName}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Mensajes;
