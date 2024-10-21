// src/components/TopBar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./TopBar.css"; // Archivo de estilos

const TopBar = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); // Redirige a la página de inicio de sesión
  };

  return (
    <div className="topbar-container">
      <div className="user-info">
        <p>{currentUser?.displayName || "Usuario Anónimo"}</p>
        <p>{currentUser?.email}</p>
      </div>
      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </div>
  );
};

export default TopBar;
