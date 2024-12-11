import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verificar si está en la colección employees o es admin
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const employeeDoc = await getDoc(doc(db, "employees", user.uid));

      if (userDoc.exists() && userDoc.data().isAdmin) {
        navigate("/dashboard"); // Admin tiene acceso
      } else if (employeeDoc.exists()) {
        navigate("/dashboard"); // Employee tiene acceso
      } else {
        throw new Error("No tienes permisos para acceder a la plataforma.");
      }
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-box">
          <h1 className="login-title">Soy</h1>
          <p className="login-subtitle">
            Bienvenido al sistema de administración
          </p>

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
              className={`login-button button-primary ${
                loading ? "loading" : ""
              }`}
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
