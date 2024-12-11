// src/page/auth/authContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getAlbums, createAlbum, updateAlbum, deleteAlbum, getBeneficiarios } from '../../firebase'; // Asegúrate de incluir getBeneficiarios
import { onAuthStateChanged } from 'firebase/auth';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Crear el proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [albums, setAlbums] = useState([]);
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userAlbums = await getAlbums(user.uid);
                    setAlbums(userAlbums);
                    const userBeneficiarios = await getBeneficiarios(user.uid); // Si es específico por usuario
                    setBeneficiarios(userBeneficiarios);
                } catch (error) {
                    console.error("Error al obtener datos del usuario:", error);
                }
            } else {
                setAlbums([]);
                setBeneficiarios([]);
            }
            setLoading(false);
        });

        // Limpiar el listener al desmontar el componente
        return () => unsubscribe();
    }, []);

    // Función para crear un nuevo álbum
    const addAlbum = async (albumName, backgroundColor, beneficiarioId) => {
        if (!currentUser) return;
        try {
            const newAlbum = await createAlbum(currentUser.uid, albumName, backgroundColor, beneficiarioId);
            setAlbums([...albums, newAlbum]);
        } catch (error) {
            console.error("Error al crear álbum:", error);
        }
    };

    // Función para actualizar un álbum
    const modifyAlbum = async (albumId, updatedData) => {
        if (!currentUser) return;
        try {
            await updateAlbum(currentUser.uid, albumId, updatedData);
            setAlbums(albums.map(album => album.id === albumId ? { ...album, ...updatedData } : album));
        } catch (error) {
            console.error("Error al actualizar álbum:", error);
        }
    };

    // Función para eliminar un álbum
    const removeAlbum = async (albumId) => {
        if (!currentUser) return;
        try {
            await deleteAlbum(currentUser.uid, albumId);
            setAlbums(albums.filter(album => album.id !== albumId));
        } catch (error) {
            console.error("Error al eliminar álbum:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            albums,
            beneficiarios,
            addAlbum,
            modifyAlbum,
            removeAlbum
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Crear un hook para usar el contexto de autenticación
export const useAuth = () => {
    return useContext(AuthContext);
};
