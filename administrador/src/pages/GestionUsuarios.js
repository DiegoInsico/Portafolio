import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./GestionUsuarios.css";

const GestionUsuarios = () => {
  const [users, setUsers] = useState([]);

  // Obtener usuarios de Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error obteniendo usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Cambiar el rol de un usuario
  const handleRoleChange = async (userId, newRole) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error cambiando rol del usuario:", error);
    }
  };

  // Habilitar o deshabilitar un usuario
  const handleToggleStatus = async (userId, isActive) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { isActive: !isActive });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: !isActive } : user
        )
      );
    } catch (error) {
      console.error("Error actualizando estado del usuario:", error);
    }
  };

  return (
    <div className="gestion-usuarios-container">
      <h1 className="gestion-usuarios-title">Gestión de Usuarios</h1>
      <ul className="gestion-usuarios-list">
        {users.map((user) => (
          <li key={user.id} className="gestion-usuarios-item">
            <div className="user-info">
              <p className="user-name">
                <strong>{user.displayName || "Nombre no definido"}</strong>
              </p>
              <p className="user-email">Email: {user.email}</p>
              <p className="user-role">Rol: {user.role}</p>
            </div>
            <div className="user-actions">
              <button
                className="gestion-usuarios-button"
                onClick={() =>
                  handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")
                }
              >
                Cambiar a {user.role === "admin" ? "Usuario" : "Admin"}
              </button>
              <button
                className={`gestion-usuarios-button ${
                  user.isActive ? "status-active" : "status-inactive"
                }`}
                onClick={() => handleToggleStatus(user.id, user.isActive)}
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
