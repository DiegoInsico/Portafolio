// src/pages/RegisterPage.js

import React, { useState } from 'react';
import { createUser } from '../../firebase'; // Importa la función de creación de usuario desde Firebase
import './Register.css';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await createUser(email, password);
            setSuccess("Registro exitoso. Ahora puedes iniciar sesión.");
            setEmail('');
            setPassword('');
        } catch (err) {
            setError("Error al registrar usuario. Intenta nuevamente.");
            console.error("Error en registro:", err);
        }
    };

    return (
        <div className="auth-container">
            <h2>Registrar</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="email"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
};

export default RegisterPage;
