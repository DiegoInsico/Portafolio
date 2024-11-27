// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para navegar entre rutas
import { useNavigate } from 'react-router-dom'; // Para la funcionalidad de logout
import { signOutUser } from '../../firebase';
import { FaBook, FaPhotoVideo, FaTasks, FaClock, FaEnvelope, FaBars, FaTimes } from 'react-icons/fa'; // Importa iconos opcionales
import './Navbar.css';

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [menuActive, setMenuActive] = useState(false); // Estado para el menú hamburguesa
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOutUser();
            console.log("Cerrando sesión...");
            navigate("/auth/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            if (window.scrollY > lastScrollY && window.scrollY > 50) {
                setShowNavbar(false);
            } else {
                setShowNavbar(true);
            }
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            return () => {
                window.removeEventListener('scroll', controlNavbar);
            };
        }
    }, [lastScrollY]);

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };

    const closeMenu = () => {
        setMenuActive(false);
    };

    return (
        <nav className={`navbar ${showNavbar ? '' : 'navbar--hidden'}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    {/* Puedes reemplazar el texto "Soy" por un logo si lo deseas */}
                    <span className="brand-logo">Soy</span>
                </Link>
                <ul className={`navbar-links ${menuActive ? 'active' : ''}`}>
                    <li>
                        <Link to="/prueba" onClick={closeMenu}>
                            <FaBook className="icon" /> Pruebas
                        </Link>
                    </li>
                    <li>
                        <Link to="/album" onClick={closeMenu}>
                            <FaPhotoVideo className="icon" /> Tu Álbum
                        </Link>
                    </li>
                    <li>
                        <Link to="/organize" onClick={closeMenu}>
                            <FaTasks className="icon" /> Ordena tu Vida
                        </Link>
                    </li>
                    <li>
                        <Link to="/linea-tiempo" onClick={closeMenu}>
                            <FaClock className="icon" /> Línea de Tiempo
                        </Link>
                    </li>
                    <li>
                        <Link to="/mensajes" onClick={closeMenu}>
                            <FaEnvelope className="icon" /> Tus Mensajes
                        </Link> {/* Nuevo enlace agregado */}
                    </li>
                </ul>
                <div className="navbar-actions">
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                    <div className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Menu" role="button" tabIndex={0}
                        onKeyPress={(e) => { if (e.key === 'Enter') toggleMenu(); }}>
                        {menuActive ? <FaTimes className="hamburger-icon" /> : <FaBars className="hamburger-icon" />}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
