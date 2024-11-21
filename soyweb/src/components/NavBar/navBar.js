// src/components/Navbar.js
import React from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate } from 'react-router-dom';
import { signOutUser } from '../../firebase'; // Ajusta la ruta según tu estructura de archivos
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOutUser(); // Llama a la función para cerrar sesión
            console.log("Cerrando sesión...");
            navigate("/auth/login"); // Redirige al usuario a la página de inicio de sesión
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <nav className="navbar">
            {/* Logo a la izquierda */}
            <Link to="/" smooth={true} duration={500} className="navbar-brand">
                Soy
            </Link>

            {/* Enlaces centrales */}
            <div className="navbar-center">
                <Link to="/prueba" smooth={true} duration={500}>Pruebas</Link>
                <ScrollLink to="historia" smooth={true} duration={500}>Historia de vida</ScrollLink>
                <Link to="/album" smooth={true} duration={500}>Tu álbum</Link>
                <ScrollLink to="ordena" smooth={true} duration={500}>Ordena tu vida</ScrollLink>
            </div>

            {/* Acciones a la derecha */}
            <div className="navbar-actions">
                <ScrollLink to="perfil" smooth={true} duration={500}>Perfil</ScrollLink>
                <button onClick={handleLogout} className="logout-button">
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
