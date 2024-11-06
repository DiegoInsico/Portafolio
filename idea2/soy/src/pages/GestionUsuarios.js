// src/pages/GestionUsuarios.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./GestionUsuarios.css"; // Archivo de estilos

const GestionUsuarios = () => {
  const [users, setUsers] = useState([]);

  // Obtener usuarios de Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  // Función para cambiar el rol de un usuario
  const handleRoleChange = async (userId, newRole) => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { role: newRole });
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Función para habilitar/deshabilitar un usuario
  const handleToggleStatus = async (userId, isActive) => {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { isActive: !isActive });
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isActive: !isActive } : user
      )
    );
  };

  return (
    <div className="gestion-usuarios-container">
      <h2>Gestión de Usuarios</h2>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <div className="user-info">
              <p>
                <strong>{user.displayName || "Nombre de usuario no definido, definelo en configuraciones."}</strong>
              </p>
              <p>Email: {user.email}</p>
              <p>Rol: {user.role}</p>
            </div>
            <div className="user-actions">
              <button
                className="role-button"
                onClick={() =>
                  handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")
                }
              >
                Cambiar a {user.role === "admin" ? "Usuario" : "Admin"}
              </button>
              <button
                className="status-button"
                onClick={() => handleToggleStatus(user.id, user.isActive)}
                style={{ backgroundColor: user.isActive ? "#f0a500" : "#555" }}
              >
                {user.isActive ? "Deshabilitar" : "Habilitar"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GestionUsuarios;
