import { toast } from "react-toastify";

const UserForm = ({ formData, setFormData, onSubmit, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-modal-overlay" onClick={onClose}>
      <div
        className="form-modal-container"
        onClick={(e) => e.stopPropagation()} // Evita cerrar el modal si se hace clic dentro
      >
        <button className="form-close-button" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={onSubmit}>
          <h2>{formData.id ? "Modificar Trabajador" : "Crear Trabajador"}</h2>
          <input
            type="text"
            name="displayName"
            placeholder="Nombre Completo"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
          />
          <input
            type="text"
            name="ciudad"
            placeholder="Ciudad"
            value={formData.ciudad}
            onChange={handleChange}
          />
          <input
            type="text"
            name="comuna"
            placeholder="Comuna"
            value={formData.comuna}
            onChange={handleChange}
          />
          <input
            type="text"
            name="pais"
            placeholder="País"
            value={formData.pais}
            onChange={handleChange}
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar Rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Operador">Operador</option>
            <option value="Analista">Analista</option>
          </select>
          <div className="form-buttons">
            <button type="submit" className="form-save-button">
              Guardar
            </button>
            <button
              type="button"
              className="form-cancel-button"
              onClick={() => {
                toast.info("Operación cancelada.");
                onClose();
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default UserForm;
