import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import './NavBar.css';

const NavBar = () => {
    const [showNav, setShowNav] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setShowNav(false); // Oculta el navbar al hacer scroll hacia abajo
            } else {
                setShowNav(true); // Muestra el navbar al hacer scroll hacia arriba
            }
            lastScrollY = window.scrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <nav className={`navbar ${showNav ? 'navbar-visible' : 'navbar-hidden'}`}>
            <h1>SOY</h1>
            <ul className="nav-links">
                <li><a href="#home">Inicio</a></li>
                <li><button onClick={handleLogout} className="logout-button">Cerrar Sesión</button></li>
            </ul>
        </nav>
    );
};

export default NavBar;
