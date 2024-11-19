import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import Container from "../../components/container";
import "./roles.css";

const RolManagement = () => {
  const [users, setUsers] = useState([]);
  const [displayForm, setDisplayForm] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    countryCode: "+56",
    phoneNumber: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "!=", ""))
    );
    const usersList = usersSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCreateUser = async () => {
    if (
      !formData.displayName ||
      !formData.email ||
      !formData.password ||
      !formData.phoneNumber
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailExists = users.some((user) => user.email === formData.email);
    if (emailExists) {
      setError("Este correo ya está registrado.");
      return;
    }

    try {
      await addDoc(collection(db, "users"), {
        displayName: formData.displayName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        role: formData.role,
        isVerified: false,
        notificationsEnabled: true,
        bio: "",
        birthDate: "",
        createdAt: new Date(),
      });
      setError("");
      setFormData({
        displayName: "",
        email: "",
        password: "",
        countryCode: "+56",
        phoneNumber: "",
        role: "user",
      });
      setDisplayForm(false);
      fetchUsers();
    } catch (error) {
      setError("Error al crear usuario.");
      console.error(error);
    }
  };

  const handleEditUser = async () => {
    try {
      await updateDoc(editingUser.ref, {
        displayName: formData.displayName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        countryCode: formData.countryCode,
        role: formData.role,
      });
      setEditingUser(null);
      setFormData({
        displayName: "",
        email: "",
        password: "",
        countryCode: "+56",
        phoneNumber: "",
        role: "user",
      });
      fetchUsers();
    } catch (error) {
      setError("Error al modificar usuario.");
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este usuario? Esta acción es irreversible."
      )
    ) {
      try {
        await deleteDoc(editingUser.ref);
        setEditingUser(null);
        setFormData({
          displayName: "",
          email: "",
          password: "",
          countryCode: "+56",
          phoneNumber: "",
          role: "user",
        });
        fetchUsers();
      } catch (error) {
        setError("Error al eliminar usuario.");
        console.error(error);
      }
    }
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setDisplayForm(true);
    setFormData({
      displayName: "",
      email: "",
      password: "",
      countryCode: "+56",
      phoneNumber: "",
      role: "user",
    });
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setDisplayForm(true);
    setFormData({
      displayName: user.displayName,
      email: user.email,
      password: "", // No se modifica la contraseña
      countryCode: user.countryCode || "+56",
      phoneNumber: user.phoneNumber || "",
      role: user.role,
    });
  };

  return (
      <div className="role-management-container">
        <div className="column col-1">
          <button className="create-user-button" onClick={openCreateForm}>
            <div className="sign">+</div>
            <div className="text">Crear Usuario</div>
          </button>
          <h3>Usuarios</h3>
          <table className="user-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.displayName}</td>
                  <td>{user.role === "admin" ? "Administrador" : "Usuario"}</td>
                  <td>
                    <button
                      onClick={() => openEditForm(user)}
                      className="edit-user-button"
                    >
                      Modificar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayForm && (
          <div className="column col-2">
            <h3>{editingUser ? "Modificar Usuario" : "Crear Usuario"}</h3>
            {error && <p className="error-message">{error}</p>}
            <input
              type="text"
              name="displayName"
              placeholder="Nombre de usuario"
              value={formData.displayName}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Correo del Usuario"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {!editingUser && (
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            )}
            <div className="phone-input">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleInputChange}
              >
                <option value="+56">Chile (+56)</option>
                <option value="+54">Argentina (+54)</option>
                <option value="+51">Perú (+51)</option>
                <option value="+57">Colombia (+57)</option>
                <option value="+58">Venezuela (+58)</option>
                <option value="+591">Bolivia (+591)</option>
              </select>
              <input
                type="number"
                name="phoneNumber"
                placeholder="Número celular"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                maxLength="9"
              />
            </div>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
            <button
              onClick={editingUser ? handleEditUser : handleCreateUser}
              className="submit-button"
            >
              {editingUser ? "Modificar Usuario" : "Crear Usuario"}
            </button>
            {editingUser && (
              <button onClick={handleDeleteUser} className="delete-user-button">
                Eliminar Usuario
              </button>
            )}
          </div>
        )}
      </div>
  );
};

export default RolManagement;
