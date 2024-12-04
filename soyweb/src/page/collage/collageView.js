// src/components/CollageView.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollageById, getEntradasByIds } from '../../firebase'; // Asegúrate de que la ruta es correcta
import { useAuth } from '../../page/auth/authContext';
import './CollageView.css';

const CollageView = () => {
    const { id } = useParams(); // Obtener el ID del collage desde la URL
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [collage, setCollage] = useState(null);
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        // Verificar si el usuario está autenticado
        if (!currentUser || !currentUser.uid) {
            return;
        }

        const fetchCollageAndEntries = async () => {
            try {
                console.log('Fetching collage with ID:', id);
                const fetchedCollage = await getCollageById(id);
                if (!fetchedCollage) {
                    return;
                }

                // Verificar si el collage pertenece al usuario actual
                if (fetchedCollage.userId !== currentUser.uid) {

                    return;
                }

                console.log('Collage fetched successfully:', fetchedCollage);
                setCollage(fetchedCollage);

                const entriesIds = fetchedCollage.entries.map(entry => entry.entryId);
                console.log('Fetching entries with IDs:', entriesIds);

                // Obtener los datos de las entradas
                const fetchedEntries = await getEntradasByIds(entriesIds);

                console.log('Entries fetched:', fetchedEntries);

                // Fusionar los datos de las entradas con las propiedades del collage
                const mergedEntries = fetchedCollage.entries.map(collageEntry => {
                    const entryData = fetchedEntries.find(entry => entry.id === collageEntry.entryId);
                    if (entryData) {
                        return {
                            ...collageEntry,
                            imageURL: entryData.imageURL || null, // Asegúrate de que 'imageURL' existe en tus documentos 'entradas'
                        };
                    } else {
                        return {
                            ...collageEntry,
                            imageURL: null,
                        };
                    }
                });

                setEntries(mergedEntries);
            } catch (err) {
                console.error('Error fetching collage:', err);

            } finally {
            }
        };

        fetchCollageAndEntries();
    }, [id, currentUser, navigate]);


    if (!collage) {
        return <p>Collage no encontrado.</p>;
    }



    return (
        <div className="collage-view-page">
            <h2>{collage.name}</h2>
            <img src={collage.thumbnail} alt={collage.name} className="collage-thumbnail" />
            <div className="collage-display">
                {entries.map((entry, index) => (

                    <div
                        key={index}
                        className="collage-entry"
                        style={{
                            position: 'absolute',
                            left: `${entry.position.x}px`,
                            top: `${entry.position.y}px`,
                            width: `${entry.size.width}px`,
                            height: `${entry.size.height}px`,
                            backgroundColor: entry.backgroundColor,
                            zIndex: 1,
                        }}
                    >
                        {console.log(entry.media)}
                        {/* Mostrar la imagen si existe */}
                        {entry.media ? (
                            <img src={entry.media} alt={`Entry ${entry.entryId}`} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <p>Imagen no disponible</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollageView;
