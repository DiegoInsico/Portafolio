import React, { useState, useEffect } from "react";
import "./userList.css";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const UserList = ({ users, onEdit, onToggleBan, onView }) => {
  const [showUsers, setShowUsers] = useState(true); // Alterna entre usuarios y trabajadores
  const [workers, setWorkers] = useState([]); // Lista de trabajadores
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerRole, setWorkerRole] = useState(""); // "Analista" o "Operador"

  // Cargar trabajadores desde Firebase
  const fetchWorkers = async () => {
    try {
      const workersSnapshot = await getDocs(collection(db, "employees"));
      const workersList = workersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          CreationRole: data.CreationRole?.toDate ? data.CreationRole.toDate() : data.CreationRole, // Convierte el timestamp si es necesario
        };
      });
      setWorkers(workersList);
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
    }
  };
  

  // Cargar usuarios y trabajadores al montar
  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div className="user-list-container">
      <h2 className="user-list-title">Gestión de Usuarios y Trabajadores</h2>

      {/* Botones para alternar vistas */}
      <div className="userlist-buttons">
        <button onClick={() => setShowUsers(true)}>Mostrar Usuarios</button>
        <button onClick={() => setShowUsers(false)}>Mostrar Trabajadores</button>
        {!showUsers && (
          <button
            className="userlist-add-worker"
            onClick={() => setShowAddWorker(true)}
          >
            Agregar Trabajador
          </button>
        )}
      </div>

      {/* Modal para agregar trabajador */}
      {showAddWorker && (
        <div className="userlist-modal-overlay">
          <div className="userlist-modal">
            <h3>Selecciona un Usuario para Asignarlo como Trabajador</h3>
            <ul className="userlist-modal-userlist">
              {users.map((user) => (
                <li key={user.id}>
                  {user.displayName} ({user.email})
                  <button
                    onClick={() => setSelectedWorker(user)}
                    className="userlist-select-user"
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
            {selectedWorker && (
              <div className="userlist-role-selection">
                <p>
                  Usuario Seleccionado:{" "}
                  <strong>{selectedWorker.displayName}</strong>
                </p>
                <label>
                  <input
                    type="radio"
                    name="workerRole"
                    value="Analista"
                    onChange={(e) => setWorkerRole(e.target.value)}
                  />
                  Analista
                </label>
                <label>
                  <input
                    type="radio"
                    name="workerRole"
                    value="Operador"
                    onChange={(e) => setWorkerRole(e.target.value)}
                  />
                  Operador
                </label>
                <button
                  onClick={async () => {
                    if (selectedWorker && workerRole) {
                      await addDoc(collection(db, "employees"), {
                        ...selectedWorker,
                        role: workerRole,
                        CreationRole: new Date(),
                      });
                      setShowAddWorker(false);
                      setSelectedWorker(null);
                      setWorkerRole("");
                      fetchWorkers(); // Actualizar lista de trabajadores
                    }
                  }}
                  className="userlist-assign-role"
                >
                  Asignar Rol
                </button>
              </div>
            )}
            <button
              onClick={() => setShowAddWorker(false)}
              className="userlist-modal-close"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Vista de Usuarios o Trabajadores */}
      {showUsers ? (
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
                  <button
                    onClick={() => onEdit(user)}
                    className="userlist-action edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onToggleBan(user.id, user.isBanned)}
                    className={`userlist-action ${
                      user.isBanned ? "ban-active" : "ban-inactive"
                    }`}
                  >
                    {user.isBanned ? "Desbanear" : "Banear"}
                  </button>
                  <button
                    onClick={() => onView(user)}
                    className="userlist-action view"
                  >
                    Ver Usuario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="worker-list">
          <h2>Lista de Trabajadores</h2>
          <ul className="worker-list-ul">
            {workers.map((worker) => (
              <li key={worker.id} className="worker-list-item">
                {worker.displayName} - {worker.role} (
                Asignado el{" "}
                {new Date(worker.CreationRole).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserList;
