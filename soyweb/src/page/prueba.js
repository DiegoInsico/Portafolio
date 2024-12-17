import React, { useContext } from 'react';
import Carousel from './entry/entry';
import { useAuth } from './auth/authContext'; // Asegúrate de tener este contexto configurado
import DocumentManager from './organizes/pageOrganize';

const Pruebas = () => {
    // Obtener el usuario autenticado desde el contexto de autenticación
    const { currentUser } = useAuth();

    // Verifica si hay un usuario autenticado
    if (!currentUser) {
        return <p>No estás autenticado. Inicia sesión para continuar.</p>;
    }

    

    return (
        <div className="test-container">
            <Carousel currentUser={currentUser}/>
        </div>
    );
};

export default Pruebas;
