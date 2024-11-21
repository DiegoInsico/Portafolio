import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Container from "../../components/container";
import UserForm from "./userForm";
import UserList from "./userList";
import "./roles.css";

const RolManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    countryCode: "+56",
    phoneNumber: "",
    role: "user",
  });
  const [displayForm, setDisplayForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  // Definir la función fetchUsers
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  // Llamar a fetchUsers al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!formData.displayName || !formData.email || !formData.password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        ...formData,
        isBanned: false,
        createdAt: new Date(),
      });
      setDisplayForm(false);
      fetchUsers(); // Actualizar usuarios
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  const handleEditUser = async () => {
    try {
      await updateDoc(editingUser.ref, {
        ...formData,
      });
      setEditingUser(null);
      setDisplayForm(false);
      fetchUsers(); // Actualizar usuarios
    } catch (error) {
      console.error("Error al modificar usuario:", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteDoc(editingUser.ref);
      setEditingUser(null);
      setDisplayForm(false);
      fetchUsers(); // Actualizar usuarios
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  const handleToggleBan = async (userId, isBanned) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { isBanned: !isBanned });
      fetchUsers(); // Actualizar usuarios
    } catch (error) {
      console.error("Error al banear/desbanear usuario:", error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <Container>
      <div className="rol-management-container">
        <button
          className="rol-create-button"
          onClick={() => {
            setDisplayForm(true);
            setEditingUser(null);
            setFormData({
              displayName: "",
              email: "",
              password: "",
              countryCode: "+56",
              phoneNumber: "",
              role: "user",
            });
          }}
        >
          Crear Usuario
        </button>

        <h1>Gestión de Roles y Usuarios</h1>

        <UserList
          users={users}
          onEdit={(user) => {
            setEditingUser(user);
            setFormData({
              displayName: user.displayName,
              email: user.email,
              countryCode: user.countryCode || "+56",
              phoneNumber: user.phoneNumber || "",
              role: user.role,
            });
            setDisplayForm(true);
          }}
          onToggleBan={handleToggleBan}
          onView={handleUserClick}
        />

        {displayForm && (
          <UserForm
            formData={formData}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
            onSubmit={editingUser ? handleEditUser : handleCreateUser}
            onDelete={editingUser ? handleDeleteUser : null}
            isEditing={!!editingUser}
            error={error}
          />
        )}

        {selectedUser && (
          <div className="user-summary-section">
            <h2>Información del Usuario</h2>
            <div className="user-summary-details">
              <img
                src={selectedUser.photoURL || "/path/to/default-image.jpg"}
                alt="Perfil"
                className="user-profile-pic"
              />
              <p>
                <strong>Nombre:</strong> {selectedUser.displayName}
              </p>
              <p>
                <strong>Correo:</strong> {selectedUser.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {selectedUser.phoneNumber || "No disponible"}
              </p>
              <p>
                <strong>Rol:</strong>{" "}
                {selectedUser.role === "admin" ? "Administrador" : "Usuario"}
              </p>
              <p>
                <strong>Bio:</strong> {selectedUser.bio || "No disponible"}
              </p>
              <p>
                <strong>Fecha de Registro:</strong>{" "}
                {selectedUser.createdAt
                  ? selectedUser.createdAt.toDate().toLocaleDateString()
                  : "No disponible"}
              </p>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default RolManagement;
