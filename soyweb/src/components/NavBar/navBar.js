

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para navegar entre rutas
import { useNavigate } from 'react-router-dom'; // Para la funcionalidad de logout
import { signOutUser } from '../../firebase';
import {
    FaBook,
    FaPhotoVideo,
    FaTasks,
    FaClock,
    FaEnvelope,
    FaBars,
    FaTimes,
    FaHandsHelping
} from 'react-icons/fa'; // Importa iconos adicionales
import './Navbar.css';

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [menuActive, setMenuActive] = useState(false); // Estado para el menú hamburguesa
    const [dropdownHastaProntoActive, setDropdownHastaProntoActive] = useState(false); // Estado para el dropdown de Hasta Pronto
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

    const toggleDropdownHastaPronto = () => {
        setDropdownHastaProntoActive(!dropdownHastaProntoActive);
    };

    const closeDropdownHastaPronto = () => {
        setDropdownHastaProntoActive(false);
    };

    return (
        <nav className={`navbar ${showNavbar ? '' : 'navbar--hidden'}`}>
            <div className="navbar-container">
                <Link
                    to="/"
                    className="navbar-brand"
                    onClick={() => { closeMenu(); closeDropdownHastaPronto(); }}
                >
                    {/* Puedes reemplazar el texto "Soy" por un logo si lo deseas */}
                    <span className="brand-logo">Soy</span>
                </Link>
                <ul className={`navbar-links ${menuActive ? 'active' : ''}`}>
                    <li>
                        <Link to="/organize" onClick={closeMenu}>
                            <FaTasks className="icon" /> Ordena tu Vida
                        </Link>
                    </li>
                    <li>
                        <Link to="/linea-tiempo" onClick={closeMenu}>
                            <FaClock className="icon" /> Carrusel de tu Vida
                        </Link>
                    </li>
                    <li>
                        <Link to="/mensajes" onClick={closeMenu}>
                            <FaEnvelope className="icon" /> Un Fragmento para Ti
                        </Link>
                    </li>
                    {/* Elemento de menú "Hasta Pronto" con sub-opciones */}
                    <li className="navbar-dropdown">
                        <div
                            className="dropdown-toggle"
                            onClick={toggleDropdownHastaPronto}
                            tabIndex={0}
                            onKeyPress={(e) => { if (e.key === 'Enter') toggleDropdownHastaPronto(); }}
                            aria-haspopup="true"
                            aria-expanded={dropdownHastaProntoActive}
                        >
                            <FaHandsHelping className="icon" /> Hasta Pronto
                        </div>
                        {dropdownHastaProntoActive && (
                            <ul className="dropdown-menu">
                                <li>
                                    <Link
                                        to="/hasta-pronto/mis-despedidas"
                                        onClick={() => { closeMenu(); closeDropdownHastaPronto(); }}
                                    >
                                        Mis Despedidas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/hasta-pronto/despedidas-asignadas"
                                        onClick={() => { closeMenu(); closeDropdownHastaPronto(); }}
                                    >
                                        Sus Despedidas
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Enlace directo "Libro de Reflexión" */}
                    <li>
                        <Link to="/libro-de-reflexion" onClick={closeMenu}>
                            <FaBook className="icon" /> Libro de Reflexión
                        </Link>
                    </li>
                    <li>
                        <Link to="/collage" onClick={closeMenu}>
                            <FaPhotoVideo className="icon" /> Pensadero
                        </Link>
                    </li>
                </ul>

                <div className="navbar-actions">
                    <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
                    <div
                        className="menu-toggle"
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => { if (e.key === 'Enter') toggleMenu(); }}
                    >
                        {menuActive ? <FaTimes className="hamburger-icon" /> : <FaBars className="hamburger-icon" />}
                    </div>
                </div>
            </div>
        </nav>
    );

};

export default Navbar;