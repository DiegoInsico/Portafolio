// src/page/auth/authContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getBeneficiarios } from '../../firebase'; // Asegúrate de incluir getBeneficiarios
import { onAuthStateChanged } from 'firebase/auth';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Crear el proveedor de autenticación
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userBeneficiarios = await getBeneficiarios(user.uid); // Si es específico por usuario
                    setBeneficiarios(userBeneficiarios);
                } catch (error) {
                    console.error("Error al obtener datos del usuario:", error);
                }
            } else {
                setBeneficiarios([]);
            }
            setLoading(false);
        });

        // Limpiar el listener al desmontar el componente
        return () => unsubscribe();
    }, []);


    return (
        <AuthContext.Provider value={{
            currentUser,
            beneficiarios,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Crear un hook para usar el contexto de autenticación
export const useAuth = () => {
    return useContext(AuthContext);
};
