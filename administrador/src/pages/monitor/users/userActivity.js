import React, { useState, useEffect } from "react";
import { db } from "../../../firebase"; // Asegúrate de tener tu configuración de Firebase
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "./users.css"; // Importar los estilos personalizados
import { useNavigate } from "react-router-dom";

const UserActivity = () => {
  const [userActivity, setUserActivity] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const activityData = [];
        const q = query(collection(db, "users"), orderBy("createdAt", "desc")); // Suponiendo que tienes un campo createdAt
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const lastLoginTime = data.createdAt.toDate(); // Convertir a objeto Date
          const formattedTime = lastLoginTime.toLocaleString(); // Formatear la fecha para mostrarla

          activityData.push({
            id: doc.id, // Here we capture the userId (Firebase document ID)
            username: data.displayName || "Usuario desconocido",
            email: data.email || "Correo desconocido",
            lastLogin: formattedTime,
            role: data.role || "Sin rol", // Extraemos el rol del usuario
          });
        });

        setUserActivity(activityData);
      } catch (error) {
        console.error("Error obteniendo actividad de los usuarios:", error);
      }
    };

    fetchUserActivity();
  }, []);

  const handleViewUser = (userId) => {
    navigate(`/monitor/users/userSummary/${userId}`); // Navegar a userSummary con el ID del usuario
  };

  // Manejar el filtro de nombre de usuario
  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
  };

  // Manejar el filtro de email
  const handleEmailFilterChange = (e) => {
    setFilterEmail(e.target.value.toLowerCase());
  };

  // Filtrar los usuarios por nombre y correo electrónico
  const filteredUsers = userActivity.filter((user) => {
    const userName = user.username.toLowerCase();
    const userEmail = user.email.toLowerCase();
    return userName.includes(filterText) && userEmail.includes(filterEmail);
  });

  return (
    <div className="dashboard-container">
      <h1>Actividad de Usuarios</h1>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Filtrar por usuario"
          className="filter-input"
          value={filterText}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="Filtrar por correo"
          className="filter-input"
          value={filterEmail}
          onChange={handleEmailFilterChange}
        />
      </div>

      <div className="settings-section">
        <h3>Historial de Inicios de Sesión</h3>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Nombre de Usuario</th>
              <th>Email</th>
              <th>Último Inicio de Sesión</th>
              <th>Rol</th> {/* Nueva columna de Rol */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.lastLogin}</td>
                <td>{user.role}</td> {/* Mostramos el rol del usuario */}
                <td>
                  <button
                    className="view-button"
                    onClick={() => handleViewUser(user.id)}
                  >
                    Ver Usuario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserActivity;
