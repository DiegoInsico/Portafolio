// src/pages/LoginPage.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./LoginPage.css"; // Archivo de estilos

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Inicia sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifica si el usuario existe en Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Si el documento existe, verificamos el rol
        const userData = docSnap.data();

      } else {
        // Si no existe el documento en Firestore, lo creamos
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName || "Usuario",
          email: user.email,
          notificationsEnabled: true,
          createdAt: new Date(),
          role: "user",  // Puedes asignar "user" por defecto o "admin" si lo deseas
        });

        // Verificar si el usuario es admin (puedes cambiar esto si es necesario)
        setError("Usuario agregado a Firestore, pero no tiene permisos de administrador.");
      }
    } catch (error) {
      // Manejo de errores en el inicio de sesión
      setError("Error en el inicio de sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
