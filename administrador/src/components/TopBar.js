import React, { useState, useEffect } from "react";
import "./TopBar.css";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const TopBar = ({ currentUser, handleLogout }) => {
  const [userInfo, setUserInfo] = useState({
    displayName: "Invitado",
    role: "Sin rol definido",
  });

  const fetchUserInfo = async () => {
    if (currentUser) {
      try {
        console.log("Consultando Firestore para buscar el correo:", currentUser.email); // Debug

        // Consultar todos los documentos en `employees`
        const employeesRef = collection(db, "employees");
        const querySnapshot = await getDocs(employeesRef);

        // Buscar un documento donde `email` coincida con el correo del usuario autenticado
        const matchingEmployee = querySnapshot.docs.find(
          (doc) => doc.data().email === currentUser.email
        );

        if (matchingEmployee) {
          const data = matchingEmployee.data();
          console.log("Documento encontrado en employees:", data); // Debug

          // Actualizar el estado con `displayName` y `role`
          setUserInfo({
            displayName: data.displayName || "Invitado",
            role: data.role || "Sin rol definido",
          });
        } else {
          console.warn(
            "No se encontró un documento en employees para el correo:",
            currentUser.email
          ); // Debug
          setUserInfo({ displayName: "Invitado", role: "Sin rol definido" });
        }
      } catch (error) {
        console.error("Error al obtener la información del usuario:", error); // Debug
        setUserInfo({ displayName: "Error", role: "Error al obtener rol" });
      }
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [currentUser]);

  return (
    <header className="topbar-container">
      {/* Información del Usuario */}
      <div className="topbar-user">
        <span>
          {currentUser
            ? `Bienvenido ${userInfo.displayName} - Rol: ${userInfo.role}`
            : "No autenticado"}
        </span>
      </div>

      {/* Título */}
      <h1>Sistema de Gestión</h1>

      {/* Botón de Cerrar Sesión */}
      <button onClick={handleLogout} className="button-secondary">
        Cerrar sesión
      </button>
    </header>
  );
};

export default TopBar;
