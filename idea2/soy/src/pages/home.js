// src/pages/HomePage.js
import React, { useState } from 'react';
import Libros from './book';
import './Home.css';
const HomePage = () => {


    return (
        <div className="home-container">

            <div className="hero-section">
                <h2>Bienvenido a SOY</h2>
                <p>Un espacio seguro para explorar, descubrir y entender tus pensamientos y emociones en un ambiente de tranquilidad y seguridad.</p>
            </div>
            <Libros />
        </div>
    );
};

export default HomePage;
