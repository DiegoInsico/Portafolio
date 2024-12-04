import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { getEntries } from '../../firebase';
import EntryCard from './entryMapper/entryCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Carousel = ({ currentUser, onEntrySelect, selectedEntries }) => {
    const [entries, setEntries] = useState([]);

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
    const handleEntryClick = (entry) => {
        // Si la entrada ya está seleccionada, la eliminamos
        if (selectedEntries.includes(entry.id)) {
            onEntrySelect(entry, false); // Pasamos false para indicar deselección
        } else {
            onEntrySelect(entry, true); // Pasamos true para indicar selección
        }
    };


    return (
        <div className="carousel-container">
            <Swiper
                className="my-swiper"
                modules={[Navigation, Pagination]}
                spaceBetween={1} // Añadido un espacio entre las tarjetas
                slidesPerView={5} // Ajustar la cantidad de tarjetas visibles
                loop={true} // Habilita el bucle infinito
                onSlideChange={(swiper) => console.log('Slide changed to index:', swiper.realIndex)} // Actualiza el índice activo
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    1024: {
                        slidesPerView: 5, // Para pantallas grandes
                    }
                }}
            >
                {entries.map((entry) => (
                    <SwiperSlide key={entry.id}>
                        <EntryCard
                            entry={entry}
                            onClick={() => handleEntryClick(entry)}
                            isSelected={selectedEntries.includes(entry.id)}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;
