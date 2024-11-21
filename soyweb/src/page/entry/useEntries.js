// src/entry/useEntries.js

import { useState, useEffect } from 'react';
import { getEntries, getAlbumEntries, getAlbumBackground, updateAlbumEntriesInDB } from '../../firebase'; // Asegúrate de ajustar la ruta si es necesario

const useEntries = (currentUser, selectedAlbum) => {
    const [entries, setEntries] = useState([]);
    const [albumEntries, setAlbumEntries] = useState([]);
    const [albumBackground, setAlbumBackground] = useState('#ffffff');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            if (currentUser) {
                console.log("Usuario actual:", currentUser.uid);
                try {
                    // Obtener todas las entradas del usuario
                    const allEntries = await getEntries(currentUser.uid);
                    console.log("Todas las entradas obtenidas:", allEntries);
                    setEntries(allEntries);

                    if (selectedAlbum) {
                        // Obtener las entradas del álbum seleccionado
                        const fetchedAlbumEntries = await getAlbumEntries(currentUser.uid, selectedAlbum.id);
                        setAlbumEntries(fetchedAlbumEntries);

                        // Obtener el color de fondo del álbum seleccionado
                        const fetchedBackground = await getAlbumBackground(currentUser.uid, selectedAlbum.id);
                        setAlbumBackground(fetchedBackground || '#ffffff');
                    } else {
                        setAlbumEntries([]);
                        setAlbumBackground('#ffffff');
                    }
                } catch (error) {
                    console.error("Error fetching entries:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                console.log("No hay usuario autenticado.");
                setEntries([]);
                setAlbumEntries([]);
                setAlbumBackground('#ffffff');
                setLoading(false);
            }
        };

        fetchEntries();
    }, [currentUser, selectedAlbum]);

    const updateAlbumEntries = async (modifyAlbumFn, albumId, newEntriesIds) => {
        try {
            await updateAlbumEntriesInDB(currentUser.uid, albumId, newEntriesIds);
            // Actualizar el estado local de albumEntries
            const updatedEntries = entries.filter(entry => newEntriesIds.includes(entry.id));
            setAlbumEntries(updatedEntries);
            // Opcional: Si modifyAlbumFn actualiza otros aspectos del álbum, puedes llamarlo aquí
        } catch (error) {
            console.error("Error al actualizar las entradas del álbum:", error);
        }
    };

    return {
        entries,
        albumEntries,
        albumBackground,
        loading,
        setAlbumBackground,
        updateAlbumEntries,
    };
};

export default useEntries;
