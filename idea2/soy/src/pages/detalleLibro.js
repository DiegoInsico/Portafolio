import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AlbumEntradas from './entries/entries';
import SelectedEntry from './entries/selectEntry';

const librosData = [
    {
        id: 1,
        titulo: 'Libro 1',
        descripcion: 'Descripción detallada del contenido del Libro 1.',
        imagen: 'book1.png',
    },
    {
        id: 2,
        titulo: 'Libro 2',
        descripcion: 'Descripción detallada del contenido del Libro 2.',
        imagen: 'book2.png',
    },
    {
        id: 3,
        titulo: 'Libro 3',
        descripcion: 'Descripción detallada del contenido del Libro 3.',
        imagen: 'book3.png',
    },
];

const pageVariants = {
    initial: {
        opacity: 0,
        x: "-100vw",
    },
    in: {
        opacity: 1,
        x: 0,
    },
    out: {
        opacity: 0,
        x: "100vw",
    },
};

const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.8,
};

const DetalleLibro = () => {
    const { id } = useParams();
    const libro = librosData.find((libro) => libro.id === parseInt(id));
    const [selectedEntry, setSelectedEntry] = useState(null); // Entrada seleccionada

    const handleSelectEntry = (entry) => {
        setSelectedEntry(entry);
    };

    if (!libro) {
        return <p>Libro no encontrado</p>;
    }

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={styles.container}
        >
            {/* Zona izquierda: Álbum de entradas */}
            <div style={styles.leftPage}>
                <AlbumEntradas onSelectEntry={handleSelectEntry} />
            </div>

            <div style={styles.separator}></div>

            {/* Zona derecha: Detalle de la entrada seleccionada */}
            <div style={styles.rightPage}>
                {selectedEntry ? (
                    <SelectedEntry entry={selectedEntry} />
                ) : (
                    <p>Selecciona una entrada para ver los detalles.</p>
                )}
            </div>
        </motion.div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        width: '90vw',
        height: '100vh',
        margin: 'auto',
        marginBottom: '20px',
        backgroundColor: '#f5f5dc',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        borderRadius: '8px',
    },
    leftPage: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        boxShadow: 'inset -2px 0 5px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto',
    },
    separator: {
        width: '2px',
        backgroundColor: '#ccc',
        boxShadow: 'inset -2px 0px 5px rgba(0, 0, 0, 0.2)',
    },
    rightPage: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, rgba(240, 214, 204, 0.8), rgba(189, 209, 197, 0.8), rgba(255, 240, 245, 0.8))', // Fondo degradado
        alignItems: 'center',
        textAlign: 'center',
        overflowY: 'auto',
        borderRadius: '8px',
    },
};


export default DetalleLibro;
