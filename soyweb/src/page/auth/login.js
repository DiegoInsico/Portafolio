import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { signIn } from '../../firebase'; // Importa la función de inicio de sesión desde Firebase
import './Login.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Inicializa navigate

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar error previo
        try {
            await signIn(email, password);
            console.log("Inicio de sesión exitoso");
            navigate('/'); // Redirige a la página principal (home) después del inicio de sesión
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError("El correo electrónico no está registrado.");
            } else if (err.code === 'auth/wrong-password') {
                setError("La contraseña es incorrecta.");
            } else if (err.code === 'auth/invalid-email') {
                setError("El formato del correo electrónico es inválido.");
            } else {
                setError("Error al iniciar sesión. Verifica tus credenciales.");
            }
            console.error("Error en inicio de sesión:", err);
        }
    };

    return (
        <div className="auth-container">
            <h2>Iniciar Sesión</h2>
            <form onSubmit={handleLogin}>
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
                <button type="submit">Iniciar Sesión</button>
            </form>
        </div>
    );
};

export default LoginPage;
