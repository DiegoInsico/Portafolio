import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import "./LoginPage.css";

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verificar el rol del usuario en Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "admin") {
        onLogin(user);
        navigate("/dashboard");
      } else {
        setError("No tienes permisos de administrador.");
      }
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("Usuario no encontrado.");
      } else if (err.code === "auth/wrong-password") {
        setError("Contraseña incorrecta.");
      } else {
        setError("Error en el inicio de sesión. Verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-box">
          <h1 className="login-title">Soy</h1>
          <p className="login-subtitle">Bienvenido al sistema de administración</p>
  
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="login-label">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                placeholder="E-mail"
                aria-label="Correo Electrónico"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="login-label">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                placeholder="Contraseña"
                aria-label="Contraseña"
              />
            </div>
            <button
              type="submit"
              className={`login-button button-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
            {error && <p className="login-error">{error}</p>}
          </form>
          <p className="login-footer">Página en desarrollo</p>
        </div>
        <div className="login-image"></div>
      </div>
    </div>
  );
  
};

export default LoginPage;
