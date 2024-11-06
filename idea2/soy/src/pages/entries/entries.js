import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import './Entries.css';

const ENTRIES_PER_PAGE = 9;

const pageVariants = {
    initial: (direction) => ({
        x: direction > 0 ? "100vw" : "-100vw",
        opacity: 0,
    }),
    animate: {
        x: 0,
        opacity: 1,
        transition: { type: "tween", ease: "easeInOut", duration: 0.5 },
    },
    exit: (direction) => ({
        x: direction > 0 ? "-100vw" : "100vw",
        opacity: 0,
        transition: { type: "tween", ease: "easeInOut", duration: 0.5 },
    }),
};

const AlbumEntradas = ({ onSelectEntry }) => {
    const [entries, setEntries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageDirection, setPageDirection] = useState(0);

    useEffect(() => {
        const fetchEntries = async () => {
            const entriesSnapshot = await getDocs(collection(db, "entradas"));
            const entriesList = entriesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            entriesList.sort((a, b) => a.fechaCreacion.seconds - b.fechaCreacion.seconds);
            setEntries(entriesList);
        };

        fetchEntries();
    }, []);

    const indexOfLastEntry = currentPage * ENTRIES_PER_PAGE;
    const indexOfFirstEntry = indexOfLastEntry - ENTRIES_PER_PAGE;
    const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);

    const nextPage = () => {
        if (currentPage < Math.ceil(entries.length / ENTRIES_PER_PAGE)) {
            setPageDirection(1);
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setPageDirection(-1);
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="album-container">
            <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button left">
                &#9664; {/* Flecha izquierda */}
            </button>

            <AnimatePresence mode="wait" custom={pageDirection}>
                <motion.div
                    key={currentPage} // Cambia la clave para forzar la animación en cada cambio de página
                    custom={pageDirection}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    className="album-grid"
                >
                    {currentEntries.map((entry) => {
                        const creationDate = new Date(entry.fechaCreacion.seconds * 1000);
                        const formattedDate = creationDate.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        });

                        return (
                            <div
                                key={entry.id}
                                className="album-item"
                                onClick={() => onSelectEntry(entry)}
                            >
                                <div className="entry-header">
                                    {formattedDate}
                                </div>
                                <div className="entry-content">
                                    {entry.cancion?.albumImage ? (
                                        <img src={entry.cancion.albumImage} alt="Album cover" className="content-image" />
                                    ) : entry.media && entry.mediaType === "image" ? (
                                        <img src={entry.media} alt="Media content" className="content-image" />
                                    ) : entry.profileImage ? (
                                        <img src={entry.profileImage} alt="Profile" className="content-image" />
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            <button onClick={nextPage} disabled={currentPage === Math.ceil(entries.length / ENTRIES_PER_PAGE)} className="pagination-button right">
                &#9654; {/* Flecha derecha */}
            </button>
        </div>
    );
};

export default AlbumEntradas;
