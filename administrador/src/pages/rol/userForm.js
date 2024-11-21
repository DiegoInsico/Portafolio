import React from "react";
import "./userForm.css";

const UserForm = ({
  formData,
  onChange,
  onSubmit,
  onDelete,
  isEditing,
  error,
}) => {
  return (
    <div className="rol-form">
      <h2>{isEditing ? "Modificar Usuario" : "Crear Usuario"}</h2>
      {error && <p className="rol-error">{error}</p>}
      <input
        type="text"
        name="displayName"
        placeholder="Nombre de usuario"
        value={formData.displayName}
        onChange={onChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email}
        onChange={onChange}
        required
      />
      {!isEditing && (
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={onChange}
          required
        />
      )}
      <div className="phone-input">
        <select
          name="countryCode"
          value={formData.countryCode}
          onChange={onChange}
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
          onChange={onChange}
          required
        />
      </div>
      <select name="role" value={formData.role} onChange={onChange} required>
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
      </select>
      <button onClick={onSubmit} className="submit-button">
        {isEditing ? "Modificar Usuario" : "Crear Usuario"}
      </button>
      {isEditing && (
        <button onClick={onDelete} className="delete-user-button">
          Eliminar Usuario
        </button>
      )}
    </div>
  );
};

export default UserForm;
