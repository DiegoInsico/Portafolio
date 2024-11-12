import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "./users.css"; // Importa estilos específicos para UserActivity
import { useNavigate } from "react-router-dom";
import Container from "../../../components/container"; // Asegúrate de que Container esté configurado correctamente

const UserActivity = () => {
  const [userActivity, setUserActivity] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        const activityData = [];
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        snapshot.forEach((doc) => {
          const data = doc.data();
          const lastLoginTime = data.createdAt.toDate();
          const formattedTime = lastLoginTime.toLocaleString();

          activityData.push({
            id: doc.id,
            username: data.displayName || "Usuario desconocido",
            email: data.email || "Correo desconocido",
            lastLogin: formattedTime,
            role: data.role || "Sin rol",
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
    navigate(`/monitor/users/userSummary/${userId}`);
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value.toLowerCase());
  };

  const handleEmailFilterChange = (e) => {
    setFilterEmail(e.target.value.toLowerCase());
  };

  const filteredUsers = userActivity.filter((user) => {
    const userName = user.username.toLowerCase();
    const userEmail = user.email.toLowerCase();
    return userName.includes(filterText) && userEmail.includes(filterEmail);
  });

  return (
    <Container>
      <div className="user-activity-container">
        <h1>Actividad de Usuarios</h1>

        <div className="user-filters">
          <input
            type="text"
            placeholder="Filtrar por usuario"
            className="user-filter-input"
            value={filterText}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            placeholder="Filtrar por correo"
            className="user-filter-input"
            value={filterEmail}
            onChange={handleEmailFilterChange}
          />
        </div>

        <div className="user-settings-section">
          <h3>Historial de Inicios de Sesión</h3>
          <table className="user-activity-table">
            <thead>
              <tr>
                <th>Nombre de Usuario</th>
                <th>Email</th>
                <th>Creacion de la cuenta</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.lastLogin}</td>
                  <td>{user.role}</td>
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
    </Container>
  );
};

export default UserActivity;
