// src/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth"; // Importamos correctamente
import "./Dashboard.css";
import CategoryChart from "./CategoryChart";

const Dashboard = () => {
  const [numEntries, setNumEntries] = useState(0);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth(); // Obtener la instancia de autenticación

  // Obtener estadísticas de Firestore sobre las entradas y usuarios
  useEffect(() => {
    const fetchEntries = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      setNumEntries(entriesSnapshot.size);
    };

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setNewDisplayName(user?.displayName || "");
    });

    fetchEntries();
    fetchUsers();

    return () => unsubscribe();
  }, [auth]);

  // Función para actualizar el nombre del usuario
  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();
    try {
      if (currentUser) {
        // Actualiza el displayName del usuario autenticado
        await updateProfile(currentUser, { displayName: newDisplayName });
        setMessage("Nombre actualizado exitosamente.");
      }
    } catch (error) {
      console.error("Error al actualizar el nombre:", error);
      setMessage("Error al actualizar el nombre.");
    }
  };

  return (
    <div className="dashboard-container">

      <h1>Panel de Administración</h1>

      <div className="dashboard-grid">
        {/* Tarjeta de Resumen de Entradas */}
        <div className="dashboard-card" onClick={() => navigate("/entradas")}>
          <h3>Entradas</h3>
          <p className="number-display">{numEntries}</p>
          <p className="description">Total de entradas registradas.</p>
        </div>

        {/* Tarjeta de Gestión de Usuarios */}
        <div className="dashboard-card" onClick={() => navigate("/gestion-usuarios")}>
          <h3>Usuarios</h3>
          <p className="number-display">{users.length}</p>
          <p className="description">Usuarios activos en el sistema.</p>
        </div>

        {/* Tarjeta de Gráfico de Categorías */}
        <div className="dashboard-card">
          <h3>Categorías</h3>
          <div className="chart-container">
            <CategoryChart />
          </div>
          <p className="description">Distribución de entradas por categoría.</p>
        </div>
      </div>

      {/* Sección de Configuración */}
      <div className="settings-section">
        <h3>Configuraciones</h3>
        <form onSubmit={handleUpdateDisplayName}>
          <div className="form-group">
            <label>Cambiar Nombre de Usuario</label>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="update-button">
            Actualizar Nombre
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
