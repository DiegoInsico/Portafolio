import React, { useState, useEffect } from "react";
import "./Mensajes.css";
import { getMensajesForUser } from "../../firebase"; // Asegúrate de que la ruta es correcta
import { useAuth } from "../../page/auth/authContext";

const Mensajes = () => {
  const { currentUser } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMensajes = async () => {
    if (!currentUser) {
      setError("Usuario no autenticado.");
      setLoading(false);
      return;
    }
    try {
      const mensajesObtenidos = await getMensajesForUser(currentUser.email);
      console.log("Mensajes obtenidos:", mensajesObtenidos); // Verifica el contenido
      setMensajes(mensajesObtenidos);
    } catch (err) {
      console.error("Error al obtener mensajes:", err);
      setError("Error al obtener los mensajes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [currentUser]);

  return (
    <div className="scroll-container">
      <div className="banner-container">
        {/* Hero Section */}
        <section className="banner-section">
          <div className="page-one">
            <div className="banner-content-left">
              <h1>Un</h1>
              <h1>Mensaje</h1>
              <h1>Para ti</h1>
            </div>
            <div className="banner-content-right">
              <p>
                Este es el lugar donde puedes guardar todas tus pertenencias:
                correos electrónicos, cuentas bancarias, seguros de vida y todo lo
                que consideres relevante para tus seres queridos.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de Mensajes */}
        <section className="banner-section">
          <div className="mensajes-container">
            {loading ? (
              <p className="mensajes-loading">Cargando mensajes...</p>
            ) : error ? (
              <p className="mensajes-error">{error}</p>
            ) : mensajes.length === 0 ? (
              <p className="no-messages">No tienes mensajes aún.</p>
            ) : (
              mensajes.map((mensaje) => {
                console.log(mensaje); // Verifica la estructura de cada mensaje
                return (
                  <div key={mensaje.id} className="mensaje-item">
                    <div className="mensaje-media">
                      {mensaje.media && mensaje.mediaType === "video" ? (
                        <video controls src={mensaje.media} className="mensaje-video" />
                      ) : (
                        <p>No hay medios asociados.</p>
                      )}
                    </div>
                    <div className="mensaje-content">
                      <h3>{mensaje.titulo || "Mensaje sin título"}</h3>
                      <p>{mensaje.contenido || "Mensaje sin contenido"}</p>
                      <p className="fecha-envio">
                        Enviado el:{" "}
                        {mensaje.fechaEnvio
                          ? new Date(mensaje.fechaEnvio.seconds * 1000).toLocaleString()
                          : "Fecha desconocida"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Mensajes;
