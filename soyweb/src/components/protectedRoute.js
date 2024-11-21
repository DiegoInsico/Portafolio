// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../page/auth/authContext'

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth(); // Obtén el usuario actual desde el contexto

    if (!currentUser) {
        return <Navigate to="/auth/login" />;
    }
    return children;
};

export default ProtectedRoute;
