import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { Link, useNavigate } from 'react-router-dom';
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
                    <ScrollLink to="historia" smooth={true} duration={500}>Historia de vida</ScrollLink>
                    <Link to="/album">Tu álbum</Link>
                    <Link to="/organize">Ordena tu vida</Link>
                </div>
                <div className="navbar-actions">
                    <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
