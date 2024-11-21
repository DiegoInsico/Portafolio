import React from "react";
import "./userList.css";

const UserList = ({ users, onEdit, onToggleBan, onView }) => {
  return (
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
            <td>{user.role === "admin" ? "Administrador" : "Usuario"}</td>
            <td>{user.isBanned ? "Baneado" : "Activo"}</td>
            <td>
              <button onClick={() => onEdit(user)}>Editar</button>
              <button
                onClick={() => onToggleBan(user.id, user.isBanned)}
                className={user.isBanned ? "ban-active" : "ban-inactive"}
              >
                {user.isBanned ? "Desbanear" : "Banear"}
              </button>
              <button onClick={() => onView(user)}>Ver Usuario</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserList;
