import React from "react";
import "./userList.css";

const UserList = ({ users, onEdit, onToggleBan, onView }) => {
  return (
    <div className="user-list-container">
      <h2 className="user-list-title">Lista de Usuarios</h2>
      <table className="rol-user-table">
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
                  className="action-button edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => onToggleBan(user.id, user.isBanned)}
                  className={
                    user.isBanned
                      ? "action-button ban-active"
                      : "action-button ban-inactive"
                  }
                >
                  {user.isBanned ? "Desbanear" : "Banear"}
                </button>
                <button
                  onClick={() => onView(user)}
                  className="action-button view"
                >
                  Ver Usuario
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
