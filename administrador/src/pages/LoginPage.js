// LoginPage.js
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
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "admin") {
        onLogin(user);
        navigate("/dashboard");
      } else {
        setError("No tienes permisos de administrador.");
      }
    } catch (error) {
      setError("Error en el inicio de sesión. Verifica tus credenciales.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-side"></div>
      <div className="center-content">
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
      <div className="login-side"></div>
    </div>
  );
};

export default LoginPage;
