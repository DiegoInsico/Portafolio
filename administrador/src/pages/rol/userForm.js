import React from "react";
import "./userForm.css";

const UserForm = ({
  isOpen,
  formData,
  onChange,
  onSubmit,
  onDelete,
  onClose,
  isEditing,
  error,
}) => {
  if (!isOpen) return null; // Si el modal no está abierto, no mostrar nada

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? "Modificar Usuario" : "Crear Usuario"}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          {error && <p className="modal-error">{error}</p>}
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
          <input
            type="date"
            name="birthDate"
            placeholder="Fecha de nacimiento"
            value={formData.birthDate}
            onChange={onChange}
            required
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            value={formData.ciudad}
            onChange={onChange}
            required
          />
          <input
            type="text"
            name="comuna"
            placeholder="Comuna"
            value={formData.comuna}
            onChange={onChange}
            required
          />
          <input
            type="text"
            name="pais"
            placeholder="País"
            value={formData.pais}
            onChange={onChange}
            required
          />
          <div className="role-input">
            <label>
              <input
                type="radio"
                name="isAdmin"
                value={true}
                checked={formData.isAdmin === true}
                onChange={(e) =>
                  onChange({ target: { name: "isAdmin", value: true } })
                }
              />
              Administrador
            </label>
            <label>
              <input
                type="radio"
                name="isAdmin"
                value={false}
                checked={formData.isAdmin === false}
                onChange={(e) =>
                  onChange({ target: { name: "isAdmin", value: false } })
                }
              />
              Usuario
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onSubmit} className="submit-button">
            {isEditing ? "Modificar Usuario" : "Crear Usuario"}
          </button>
          {isEditing && (
            <button onClick={onDelete} className="delete-user-button">
              Eliminar Usuario
            </button>
          )}
          <button onClick={onClose} className="cancel-button">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
