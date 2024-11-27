import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { getEntries } from '../../firebase'; // Asegúrate de que este método funcione
import EntryCard from './entryMapper/entryCard';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = ({ currentUser }) => {
    const [entries, setEntries] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Obtener las entradas de Firestore
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const entriesData = await getEntries(currentUser);
                setEntries(entriesData);
            } catch (error) {
                console.error("Error fetching entries:", error);
            }
        };
        fetchEntries();
    }, [currentUser]);

    // Configuración de react-slick
    const settings = {
        centerMode: true,  // Muestra la tarjeta central más grande
        infinite: true,    // Carrusel infinito
        centerPadding: '0', // No agrega relleno a los lados de la tarjeta central
        slidesToShow: 5,   // Muestra 5 tarjetas
        speed: 500,        // Velocidad de transición
        focusOnSelect: true, // Permite seleccionar la tarjeta al hacer clic
        arrows: true,      // Muestra las flechas
        beforeChange: (current, next) => {
            setCurrentIndex(next);  // Cambia el índice cuando se cambia la tarjeta
        },
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    };

    return (
        <div className="carousel-container">
            <Slider {...settings}>
                {entries.map((entry, index) => (
                    <div
                        key={entry.id}
                        className={`carousel-item ${index === currentIndex ? 'center' : ''}`} // Aplica la clase 'center' a la tarjeta en el centro
                    >
                        <EntryCard entry={entry} onClick={(entry) => console.log(entry)} />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Carousel;
