// src/components/LineaDeTiempo.js

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import useEntries from "../entry/useEntries";
import { useAuth } from "../auth/authContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./LineaDeTiempo.css";
import { ClipLoader } from "react-spinners";
import { FaRegCalendarAlt, FaSmile, FaLightbulb } from "react-icons/fa";
import PasswordOverlay from "../../components/PasswordOverlay"; // Importar el nuevo componente PasswordOverlay

const DetalleEntrada = ({ entrada, onClose }) => (
    <>
        <div className="modal-overlay" onClick={onClose}></div>
        <div className="detalle-entrada">
            <div className="detalle-header">
                <h2>{entrada.nickname || "Sin nombre"}</h2>
                <button className="detalle-close" onClick={onClose}>
                    &times;
                </button>
            </div>
            <div className="detalle-body">
                {/* Imagen */}
                <div className="detalle-image">
                    <img
                        src={entrada.media || "https://via.placeholder.com/400"}
                        alt={entrada.nickname || "Sin nombre"}
                        className="detalle-img"
                    />
                </div>

                {/* Información principal */}
                <div className="detalle-info">
                    <p>
                        <FaLightbulb />
                        <strong>Categoría:</strong> {entrada.categoria || "Sin categoría"}
                    </p>
                    <p>
                        <strong>Texto:</strong> {entrada.texto || "Sin texto"}
                    </p>
                    <p>
                        <FaSmile />
                        <strong>Emociones:</strong>{" "}
                        {entrada.emociones ? entrada.emociones.join(", ") : "N/A"}
                    </p>
                    <p>
                        <strong>Nivel:</strong> {entrada.nivel || "N/A"}
                    </p>
                    <p>
                        <FaRegCalendarAlt />
                        <strong>Fecha de creación:</strong>{" "}
                        {entrada.fechaCreacion || "Sin fecha"}
                    </p>
                </div>
            </div>

            {/* Reflexiones */}
            {entrada.reflexiones && entrada.reflexiones.length > 0 && (
                <div className="detalle-reflexiones">
                    <h3>Reflexiones</h3>
                    <ul>
                        {entrada.reflexiones.map((reflexion, index) => (
                            <li key={index}>
                                <FaLightbulb />
                                {reflexion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    </>
);

const LineaDeTiempo = () => {
    const { currentUser } = useAuth();
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(1); // Nivel por defecto
    const [levelUnlocked, setLevelUnlocked] = useState({
        1: true, // Nivel 1 siempre desbloqueado
        2: false,
        3: false
    });
    const [showPasswordOverlay, setShowPasswordOverlay] = useState(false);
    const [levelToUnlock, setLevelToUnlock] = useState(null);
    
    const { entries, loading } = useEntries(currentUser, null, selectedLevel);

    useEffect(() => {
        // Filtrar las entradas según el nivel seleccionado y si están desbloqueadas
        if (selectedLevel > 1 && !levelUnlocked[selectedLevel]) {
            // Mostrar el overlay para desbloquear el nivel
            setShowPasswordOverlay(true);
            setLevelToUnlock(selectedLevel);
            setSelectedLevel(prev => 1); // Revertir temporalmente al nivel 1
        }
    }, [selectedLevel, levelUnlocked]);

    const settings = {
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 800,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: { slidesToShow: 2 },
            },
            {
                breakpoint: 600,
                settings: { slidesToShow: 1 },
            },
        ],
    };

    const handleItemClick = (entrada) => setEntradaSeleccionada(entrada);
    const closeDetalle = () => setEntradaSeleccionada(null);

    const handleLevelSelect = (level) => {
        if (level > 1 && !levelUnlocked[level]) {
            setLevelToUnlock(level);
            setShowPasswordOverlay(true);
            setSelectedLevel(prev => 1); // Revertir temporalmente al nivel 1
        } else {
            setSelectedLevel(level);
        }
    };

    const handlePasswordSuccess = () => {
        setLevelUnlocked(prev => ({
            ...prev,
            [levelToUnlock]: true
        }));
        setSelectedLevel(levelToUnlock);
        setLevelToUnlock(null);
    };

    const handlePasswordOverlayClose = () => {
        setShowPasswordOverlay(false);
        setLevelToUnlock(null);
    };

    return (
        <div className="scroll-container">
            {/* Hero Section */}
            <section className="timeline-section">
                <div className="page-one">
                    <div className="titulo-left">
                        <h1>La línea</h1>
                        <h1>de tu</h1>
                        <h1>Tiempo</h1>
                    </div>
                    <div className="titulo-right">
                        <p>
                            Este es el lugar donde puedes guardar todas tus pertenencias:
                            correos electrónicos, cuentas bancarias, seguros de vida y todo lo
                            que consideres relevante para tus seres queridos.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline Section con Selector de Nivel Integrado */}
            <section className="timeline-section">
                <div className="timeline-container">
                    {/* Selector de Nivel Integrado */}
                    <div className="level-selector-container">
                        <label htmlFor="level-select">Selecciona Nivel:</label>
                        <select
                            id="level-select"
                            value={selectedLevel}
                            onChange={(e) => handleLevelSelect(parseInt(e.target.value, 10))}
                        >
                            <option value={1}>Nivel 1</option>
                            <option value={2}>Nivel 2</option>
                            <option value={3}>Nivel 3</option>
                        </select>
                    </div>

                    {/* Carrusel (Timeline) */}
                    {loading ? (
                        <div className="loader">
                            <ClipLoader size={50} color="#4A90E2" />
                        </div>
                    ) : entries.length === 0 ? (
                        <p>No tienes entradas para mostrar.</p>
                    ) : (
                        <Slider {...settings}>
                            {entries.map((entrada) => (
                                <div
                                    key={entrada.id}
                                    className="timeline-item"
                                    onClick={() => handleItemClick(entrada)}
                                >
                                    <div className="image-container">
                                        <img
                                            src={entrada.media || "https://via.placeholder.com/400"}
                                            alt={entrada.nickname || "Sin nombre"}
                                            className="item-image"
                                        />
                                        <div className="nickname-overlay">
                                            <h3>{entrada.nickname || "Sin nombre"}</h3>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    )}
                    {entradaSeleccionada && (
                        <DetalleEntrada
                            entrada={entradaSeleccionada}
                            onClose={closeDetalle}
                        />
                    )}
                </div>
            </section>

            {/* Final Section */}
            <section className="timeline-section">
                <div>
                    <h1>Página 3</h1>
                    <p>Contenido de la tercera página.</p>
                </div>
            </section>

            {/* Password Overlay */}
            {showPasswordOverlay && (
                <PasswordOverlay
                    level={levelToUnlock}
                    onClose={handlePasswordOverlayClose}
                    onSuccess={handlePasswordSuccess}
                />
            )}
        </div>
    );

};

export default LineaDeTiempo;
