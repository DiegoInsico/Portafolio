import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  
  

  // Función para cargar usuarios
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

  // Crear usuario
  const handleCreateUser = async () => {
    if (!formData.displayName || !formData.email || !formData.password || !formData.birthDate) {
      setError("Todos los campos son obligatorios.");
      return;
    }
  
    try {
      await addDoc(collection(db, "users"), {
        ...formData,
        birthDate: new Timestamp(Math.floor(new Date(formData.birthDate).getTime() / 1000), 0),
        isBanned: false,
        createdAt: new Date(),
      });
      setDisplayForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };
  

  // Editar usuario
  const handleEditUser = async () => {
    try {
      await updateDoc(editingUser.ref, {
        ...formData,
        birthDate: new Timestamp(Math.floor(new Date(formData.birthDate).getTime() / 1000), 0),
      });
      setEditingUser(null);
      setDisplayForm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error al modificar usuario:", error);
    }
  };
  

  // Eliminar usuario
  const handleDeleteUser = async () => {
    try {
      await deleteDoc(editingUser.ref);
      setEditingUser(null);
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Banear/Desbanear usuario
  const handleToggleBan = async (userId, isBanned) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { isBanned: !isBanned });
      fetchUsers();
    } catch (error) {
      console.error("Error al banear/desbanear usuario:", error);
    }
  };

  // Mostrar detalles del usuario
  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  return (
    <Container>
      <div className="rol-management-container">
        <h1 className="rol-management-title">Gestión de Roles y Usuarios</h1>
        {/* Botón Crear Usuario */}
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
        {/* Lista de usuarios */}
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
          onDelete={(user) => {
            setEditingUser(user);
            setShowDeleteConfirm(true); // Mostrar confirmación
          }}
          onToggleBan={handleToggleBan}
          onView={handleUserClick}
        />

        {/* Modal para creación/edición */}
        <UserForm
          isOpen={displayForm}
          formData={formData}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          onSubmit={editingUser ? handleEditUser : handleCreateUser}
          onDelete={editingUser ? handleDeleteUser : null}
          onClose={() => setDisplayForm(false)}
          isEditing={!!editingUser}
          error={error}
        />

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="modal">
            <div className="modal-content">
              <h3>¿Estás seguro de eliminar este usuario?</h3>
              <p>{editingUser?.displayName}</p>
              <div className="modal-actions">
                <button className="confirm-button" onClick={handleDeleteUser}>
                  Sí, eliminar
                </button>
                <button
                  className="cancel-button"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver detalles del usuario */}
        {selectedUser && (
          <div className="modal">
            <div className="modal-content user-details-modal">
              <button
                className="close-modal"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
              <h2>Detalles del Usuario</h2>
              <div className="user-details">
                <img
                  src={selectedUser.photoURL || "/path/to/default-image.jpg"}
                  alt="Perfil"
                  className="user-profile-pic"
                />
                <p>
                  <strong>Nombre:</strong> {selectedUser.displayName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {selectedUser.phoneNumber || "No disponible"}
                </p>
                <p>
                  <strong>País:</strong> {selectedUser.pais || "No disponible"}
                </p>
                <p>
                  <strong>Ciudad:</strong>{" "}
                  {selectedUser.ciudad || "No disponible"}
                </p>
                <p>
                  <strong>Comuna:</strong>{" "}
                  {selectedUser.comuna || "No disponible"}
                </p>
                <p>
                  <strong>Administrador:</strong>{" "}
                  {selectedUser.isAdmin ? "Sí" : "No"}
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
          </div>
        )}
      </div>
    </Container>
  );
};

export default RolManagement;
