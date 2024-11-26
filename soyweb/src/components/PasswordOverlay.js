// src/components/PasswordOverlay.js

import React, { useState } from "react";
import "./PasswordOverlay.css";
import { FaLock } from "react-icons/fa";

const PasswordOverlay = ({ level, onClose, onSuccess }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Obtener las contraseñas desde variables de entorno
    const passwords = {
        2: process.env.REACT_APP_LEVEL2_PASSWORD,
        3: process.env.REACT_APP_LEVEL3_PASSWORD
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === passwords[level]) {
            onSuccess();
            onClose();
        } else {
            setError("Contraseña incorrecta. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="password-overlay">
            <div className="password-overlay-content">
                <div className="password-overlay-header">
                    <FaLock size={24} />
                    <h2>Autenticación Nivel {level}</h2>
                </div>
                <form onSubmit={handleSubmit} className="password-overlay-form">
                    <input
                        type="password"
                        placeholder="Ingresa la contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && <p className="error-message">{error}</p>}
                    <div className="password-overlay-buttons">
                        <button type="submit">Aceptar</button>
                        <button type="button" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordOverlay;
