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
    const [activeIndex, setActiveIndex] = useState(0); // Índice de la tarjeta activa

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

    return (
        <div className="carousel-container">
            <Swiper
                className="my-swiper"
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={5}
                loop={true} // Habilita el bucle infinito
                centeredSlides={true} // Siempre centra la tarjeta activa
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)} // Actualiza el índice activo
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    1024: {
                        slidesPerView: 5,
                    },
                    768: {
                        slidesPerView: 3,
                    },
                    480: {
                        slidesPerView: 2,
                    },
                    0: {
                        slidesPerView: 1,
                    },
                }}
            >
                {entries.map((entry, index) => (
                    <SwiperSlide key={entry.id}>
                        <EntryCard
                            entry={entry}
                            onClick={() => onEntrySelect(entry)}
                            isSelected={selectedEntries.some(e => e.id === entry.id)}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Carousel;
