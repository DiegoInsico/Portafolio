import React, { useState, useEffect } from 'react';
import './Entry.css';
import EntryCard from './entryMapper/entryCard';

const EntriesManager = ({ entries, onEntryClick }) => {
    const [currentIndex, setCurrentIndex] = useState(entries.length); // Inicia en la primera copia
    const [isPaused, setIsPaused] = useState(false); // Pausa el movimiento cuando el mouse está encima
    const [index, setIndex] = useState(0);

    // Duplicamos las entradas para crear el efecto de bucle infinito
    const extendedEntries = [...entries, ...entries, ...entries]; // Tres copias para la ilusión

    const handleTransitionEnd = () => {
        // Rebota al final o al inicio si llega a los extremos duplicados
        if (currentIndex === 0) {
            setCurrentIndex(entries.length); // Rebota al final duplicado
        } else if (currentIndex === extendedEntries.length - 1) {
            setCurrentIndex(entries.length - 1); // Rebota al inicio duplicado
        }
    };

    // Desplazamiento automático
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                moveRight();
            }, 2100); // Desplazamiento automático cada 3 segundos
            return () => clearInterval(interval);
        }
    }, [currentIndex, isPaused]);

    const moveLeft = () => {
        setCurrentIndex((prev) => prev - 1);
    };

    const moveRight = () => {
        setCurrentIndex((prev) => prev + 1);
    };

    return (
        <div
            className="entries-manager"
            onMouseEnter={() => setIsPaused(true)} // Pausa el movimiento al pasar el mouse
            onMouseLeave={() => setIsPaused(false)} // Reanuda el movimiento al quitar el mouse
        >
            <div className="entries-selector">
                <h3>Entradas Disponibles</h3>
                <div className="wrapper">
                    <div className="arrow left-arrow" onClick={moveLeft}>
                        &lt;
                    </div>
                    <div
                        className="inner"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                            transition: 'transform 0.5s ease',
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedEntries.map((entry, index) => {
                            // Resalta cada 6 entradas
                            const isHighlighted = (index % 3 === 0);

                            return (
                                <EntryCard
                                    key={`${entry.id}-${index}`} // Asegura un key único para cada entrada
                                    entry={entry}
                                    onClick={onEntryClick}
                                    className={isHighlighted ? 'highlight' : ''} // Clase condicional
                                />
                            );
                        })}
                    </div>
                    <div className="arrow right-arrow" onClick={moveRight}>
                        &gt;
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntriesManager;
