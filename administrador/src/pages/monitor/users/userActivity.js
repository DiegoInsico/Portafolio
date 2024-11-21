import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, getDocs } from "firebase/firestore";
import Container from "../../../components/container";
import "./users.css";

const UserActivity = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
      <div className="user-dashboard-container">
        <div className="user-table-section">
          <h2>Usuarios</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.email.replace(/(.{2}).+(@)/, "$1****@")}</td>
                  <td>{user.role === "admin" ? "Administrador" : "Usuario"}</td>
                  <td>
                    <button
                      className="view-user-button"
                      onClick={() => handleUserClick(user)}
                    >
                      Ver usuario
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedUser && (
          <div className="user-summary-section">
            <h2>Información del Usuario</h2>
            <div className="user-summary-details">
              <img
                src={selectedUser.photoURL || "/path/to/default-image.jpg"}
                alt=""
                className="user-profile-pic"
              />
              <p><strong>Nombre:</strong> {selectedUser.displayName}</p>
              <p><strong>Correo:</strong> {selectedUser.email}</p>
              <p><strong>Teléfono:</strong> {selectedUser.phoneNumber}</p>
              <p><strong>Rol:</strong> {selectedUser.role === "admin" ? "Administrador" : "Usuario"}</p>
              <p><strong>Bio:</strong> {selectedUser.bio || "No disponible"}</p>
              <p><strong>Fecha de Registro:</strong> {selectedUser.createdAt ? selectedUser.createdAt.toDate().toLocaleDateString() : "No disponible"}</p>
            </div>
          </div>
        )}
      </div>
  );
};

export default UserActivity;
