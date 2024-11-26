// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Para navegar entre rutas
import { useNavigate } from 'react-router-dom'; // Para la funcionalidad de logout
import { signOutUser } from '../../firebase';
import './Navbar.css';

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
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

    return (
        <nav className={`navbar ${showNavbar ? '' : 'navbar--hidden'}`}>
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    Soy
                </Link>
                <div className="navbar-links">
                    <Link to="/prueba">Pruebas</Link>
                    <Link to="/album">Tu álbum</Link>
                    <Link to="/organize">Ordena tu vida</Link>
                    <Link to="/linea-tiempo">Línea de Tiempo</Link> {/* Nuevo enlace */}
                </div>
                <div className="navbar-actions">
                    <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
