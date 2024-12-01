import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; // Ruta ajustada según tu estructura de archivos
import "./userList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showUsers, setShowUsers] = useState(true);

  // Fetch users and workers from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const workersSnapshot = await getDocs(collection(db, "employees"));

        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const workersData = workersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(usersData);
        setWorkers(workersData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleToggleView = () => {
    setShowUsers(!showUsers);
  };

  const renderUsersTable = () => (
    <table className="userlist-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.displayName}</td>
            <td>{user.email}</td>
            <td>{user.isAdmin ? "Administrador" : "Usuario"}</td>
            <td>{user.isBanned ? "Baneado" : "Activo"}</td>
            <td>
              <button className="userlist-action edit">Editar</button>
              <button
                className={`userlist-action ${
                  user.isBanned ? "ban-active" : "ban-inactive"
                }`}
              >
                {user.isBanned ? "Desbanear" : "Banear"}
              </button>
              <button className="userlist-action view">Ver Usuario</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderWorkersList = () => (
    <ul className="worker-list-ul">
      {workers.map((worker) => (
        <li key={worker.id} className="worker-list-item">
          <span>{worker.displayName} - {worker.role}</span>
          <span>(Asignado el {new Date(worker.CreationRole).toLocaleDateString()})</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="user-list-container">
      <h1 className="user-list-title">Gestión de Usuarios y Trabajadores</h1>
      <div className="userlist-buttons">
        <button
          onClick={() => setShowUsers(true)}
          className={showUsers ? "active" : ""}
        >
          Mostrar Usuarios
        </button>
        <button
          onClick={() => setShowUsers(false)}
          className={!showUsers ? "active" : ""}
        >
          Mostrar Trabajadores
        </button>
      </div>
      {showUsers ? renderUsersTable() : renderWorkersList()}
    </div>
  );
};

export default UserList;
