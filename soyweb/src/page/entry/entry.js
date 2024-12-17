import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { getEntries } from '../../firebase';
import EntryCard from './entryMapper/entryCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

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
        if (selectedEntries.includes(entry.id)) {
            onEntrySelect(entry, false);
        } else {
            onEntrySelect(entry, true);
        }
    };

    console.log(entries);
    console.log(currentUser);
    return (
        <div className="carousel-container">
            <Swiper
                className="my-swiper"
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={1}
                slidesPerView={3}
                loop={true}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                    delay: 3000, // tiempo en milisegundos antes de cambiar de slide
                    disableOnInteraction: false // sigue rotando incluso si el usuario interactúa
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
