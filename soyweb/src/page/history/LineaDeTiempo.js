// src/components/LineaDeTiempo.js

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/authContext";
import "./LineaDeTiempo.css"; // Asegúrate de importar el nuevo nombre del CSS con las clases lt-
import { ClipLoader } from "react-spinners";
import PasswordOverlay from "../../components/PasswordOverlay";
import { getEntradas, getUserById } from "../../firebase";
import EmotionsMap from "../../components/EmotionsMap";
import DetalleEntrada from "../../components/DetalleEntrada";

// Importaciones de Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";

// Importa los estilos de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Importar Placeholders Locales
import textoPlaceholder from "../../assets/images/texto.webp";
import audioPlaceholder from "../../assets/images/audio.webp";
import musicaPlaceholder from "../../assets/images/texto.webp";
import videoPlaceholder from "../../assets/images/texto.webp";
import defaultPlaceholder from "../../assets/images/texto.webp";

const PLACEHOLDERS = {
  texto: textoPlaceholder,
  audio: audioPlaceholder,
  musica: musicaPlaceholder,
  video: videoPlaceholder,
  default: defaultPlaceholder,
};

const LineaDeTiempo = () => {
  const { currentUser } = useAuth();
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [levelUnlocked, setLevelUnlocked] = useState({
    1: true,
    2: false,
    3: false,
  });
  const [showPasswordOverlay, setShowPasswordOverlay] = useState(false);
  const [levelToUnlock, setLevelToUnlock] = useState(null);
  const swiper = useRef(null); // Crea la referencia a Swiper

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuración de Swiper
  const swiperParams = {
    modules: [Navigation, Pagination, Autoplay, A11y],
    spaceBetween: 50, // Aumenta el espacio entre slides
    slidesPerView: 3,
    navigation: true,
    pagination: { clickable: true },
    autoplay: { delay: 3000, disableOnInteraction: false },
    loop: true,
    breakpoints: {
      320: { slidesPerView: 1 },
      480: { slidesPerView: 1 },
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1440: { slidesPerView: 3 },
    },
    on: {
      slideChange: () => {
        // Seleccionamos todos los slides
        const slides = document.querySelectorAll('.lt-timeline-item');
        slides.forEach((slide) => {
          // Eliminamos la clase "active" de todos los slides
          slide.classList.remove('active');
        });
        // Agregamos la clase "active" al slide central
        const activeSlide = swiper.current.swiper.slides[swiper.current.swiper.activeIndex];
        activeSlide.classList.add('active');
      },
    },
  };

  const [userPasswords, setUserPasswords] = useState({
    level2Password: "",
    level3Password: "",
  });

  useEffect(() => {
    if (selectedLevel > 1 && !levelUnlocked[selectedLevel]) {
      setLevelToUnlock(selectedLevel);
      setShowPasswordOverlay(true);
      setSelectedLevel(1); // Revertir temporalmente al nivel 1
    }
  }, [selectedLevel, levelUnlocked]);

  useEffect(() => {
    const fetchEntries = async () => {
      if (!currentUser) {
        console.log("No user is logged in.");
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const entriesData = await getEntradas(currentUser.uid);
        console.log("Fetched entries:", entriesData); // Debugging
        const filteredEntries = entriesData.filter(
          (entry) => entry.nivel === selectedLevel.toString()
        );
        setEntries(filteredEntries);
      } catch (error) {
        console.error("Error fetching entries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [currentUser, selectedLevel]);

  // Efecto para obtener las contraseñas de niveles del usuario
  useEffect(() => {
    if (currentUser) {
      const fetchUserPasswords = async () => {
        try {
          const userData = await getUserById(currentUser.uid);
          if (userData) {
            const { level2Password, level3Password } = userData;
            setUserPasswords({ level2Password, level3Password });
          }
        } catch (error) {
          console.error("Error fetching user passwords:", error);
        }
      };

      fetchUserPasswords();
    }
  }, [currentUser]);

  const handleItemClick = (entrada) => setEntradaSeleccionada(entrada);
  const closeDetalle = () => setEntradaSeleccionada(null);

  const handleLevelSelect = (level) => {
    if (level > 1 && !levelUnlocked[level]) {
      setLevelToUnlock(level);
      setShowPasswordOverlay(true);
      setSelectedLevel(1); // Revertir temporalmente al nivel 1
    } else {
      setSelectedLevel(level);
    }
  };

  const handlePasswordSuccess = () => {
    setLevelUnlocked((prev) => ({
      ...prev,
      [levelToUnlock]: true,
    }));
    setSelectedLevel(levelToUnlock);
    setLevelToUnlock(null);
    setShowPasswordOverlay(false);
  };

  const handlePasswordOverlayClose = () => {
    setShowPasswordOverlay(false);
    setLevelToUnlock(null);
  };

  const renderEntradaContent = (entrada) => {
    const { mediaType, media, cancion, texto, audio } = entrada;

    // Prioridad de renderizado:
    // 1. Canción
    // 2. Media (Imagen/Video)
    // 3. Texto
    // 4. Audio
    // 5. Placeholder

    if (cancion) {
      // Mostrar la imagen del álbum de la canción
      return (
        <img
          src={cancion.albumImage || PLACEHOLDERS.musica}
          alt={cancion.name || "Sin nombre"}
          className="lt-item-image"
          loading="lazy"
        />
      );
    } else if (media) {
      if (mediaType === "video") {
        // Mostrar un placeholder de video o una imagen estática si no tienes una miniatura del video
        return (
          <img
            src={PLACEHOLDERS.video}
            alt="Video"
            className="lt-item-image"
            loading="lazy"
          />
        );
      } else {
        // Asumimos que es una imagen
        return (
          <img
            src={media || PLACEHOLDERS.default}
            alt={entrada.nickname || "Sin nombre"}
            className="lt-item-image"
            loading="lazy"
          />
        );
      }
    } else if (texto) {
      return (
        <div className="lt-entrada-texto">
          <p>{texto}</p>
        </div>
      );
    } else if (audio) {
      return (
        <div className="lt-entrada-audio">
          <audio controls>
            <source src={audio} type="audio/mpeg" />
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>
      );
    } else {
      // Mostrar placeholder si no hay contenido disponible
      return (
        <div className="lt-entrada-default">
          <p>Sin contenido disponible</p>
        </div>
      );
    }
  };

  return (
    <div className="lt-scroll-container">
      {/* Hero Section */}
      <section className="lt-timeline-section">
        <div className="lt-page-one">
          <div className="lt-titulo-left">
            <h1>El</h1>
            <h1>carrusel</h1>
            <h1>de tu Vida</h1>
          </div>
          <div className="lt-titulo-right">
            <p>
              Este es el lugar donde puedes guardar todas tus pertenencias:
              correos electrónicos, cuentas bancarias, seguros de vida y todo lo
              que consideres relevante para tus seres queridos.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section con Selector de Nivel Integrado */}
      <section className="lt-timeline-section">
        <div className="lt-timeline-container">
          {/* Selector de Nivel Integrado */}
          <div className="lt-level-selector-container">
            <label htmlFor="level-select">Selecciona Nivel:</label>
            <select
              id="level-select"
              value={selectedLevel}
              onChange={(e) =>
                handleLevelSelect(parseInt(e.target.value, 10))
              }
            >
              <option value={1}>Nivel 1</option>
              <option value={2}>Nivel 2</option>
              <option value={3}>Nivel 3</option>
            </select>
          </div>

          {/* Carrusel (Timeline) */}
          {loading ? (
            <div className="lt-loader">
              <ClipLoader size={50} color="#e67e22" />
            </div>
          ) : entries.length === 0 ? (
            <p>No tienes entradas para mostrar.</p>
          ) : (
            <Swiper {...swiperParams} ref={swiper} className="lt-swiper-container">
              {entries.map((entrada) => (
                <SwiperSlide key={entrada.id}>
                  <div
                    className="lt-timeline-item"
                    onClick={() => handleItemClick(entrada)}
                  >
                    <div className="lt-image-container">
                      {/* Renderizar contenido según el tipo */}
                      {renderEntradaContent(entrada)}
                      {/* Overlay con el apodo */}
                      <div className="lt-nickname-overlay">
                        <h3>{entrada.nickname || "Sin nombre"}</h3>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          {entradaSeleccionada && (
            <DetalleEntrada
              entrada={entradaSeleccionada}
              onClose={closeDetalle}
              currentUser={currentUser}
            />
          )}
        </div>
      </section>

      {/* Password Overlay */}
      {showPasswordOverlay && (
        <PasswordOverlay
          level={levelToUnlock}
          onClose={handlePasswordOverlayClose}
          onSuccess={handlePasswordSuccess}
          correctPassword={userPasswords[`level${levelToUnlock}Password`]}
        />
      )}
    </div>
  );
};

export default LineaDeTiempo;
