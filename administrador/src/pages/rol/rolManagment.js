import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  query,
  addDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import CustomAlert from "../../components/customAlert";
import UserForm from "./userForm";
import "./roles.css";
import { toast } from "react-toastify";

const RolManagement = () => {
  // Estados principales
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    birthDate: "0000-00-00",
    pais: "",
    ciudad: "",
    comuna: "",
    role: "",
  });
  const [displayForm, setDisplayForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const convertTimestampToDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0];
  };

  // Fetch inicial de datos
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Obtener trabajadores existentes
  const fetchEmployees = async () => {
    try {
      const employeesSnapshot = await getDocs(collection(db, "employees"));
      const employeesData = employeesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  // Crear empleado en Firestore
  const handleCreateEmployee = async () => {
    try {
      if (!formData.email || !formData.role) {
        setAlertMessage("El correo y el rol son obligatorios.");
        return;
      }

      const docRef = await addDoc(collection(db, "employees"), {
        ...formData,
        CreationRole: new Date(),
      });

      // Actualizar el documento con su propio ID
      await updateDoc(doc(db, "employees", docRef.id), { id: docRef.id });

      setAlertMessage("Trabajador creado con éxito.");
      fetchEmployees();
    } catch (error) {
      console.error("Error al crear trabajador:", error);
      setAlertMessage("Error al crear trabajador: " + error.message);
    }
  };

  // Autenticar empleado y actualizar Firestore
  const handleAuthenticateEmployee = async (employee) => {
    // Mostrar alerta de confirmación
    setAlertMessage(
      `¿Estás seguro de autenticar a ${employee.displayName}? Serás redirigido a su cuenta para hacer pruebas.`
    );

    const confirmAuthentication = window.confirm(
      `¿Estás seguro de autenticar a ${employee.displayName}? Serás redirigido a su cuenta para hacer pruebas.`
    );

    if (!confirmAuthentication) {
      setAlertMessage("Autenticación cancelada por el usuario.");
      return;
    }

    const adminEmail = auth.currentUser?.email; // Obtener correo del admin actual
    const adminPassword = "admin-password"; // Cambiar por la contraseña real

    try {
      // Crear usuario en Firebase Authentication
      const { user } = await createUserWithEmailAndPassword(
        auth,
        employee.email,
        "contraseña-segura-por-defecto"
      );

      // Actualizar el documento en Firestore con el UID del usuario autenticado
      await updateDoc(doc(db, "employees", employee.id), {
        authId: user.uid,
        isAuthenticated: true,
      });

      setAlertMessage(
        `Empleado ${employee.displayName} autenticado con éxito. Redirigiendo a su cuenta...`
      );

      // Restaurar sesión del administrador después de la prueba
      setTimeout(async () => {
        if (adminEmail) {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          setAlertMessage("Sesión del administrador restaurada.");
        }
      }, 5000);
    } catch (error) {
      console.error("Error al autenticar empleado:", error);
      setAlertMessage("Error al autenticar empleado: " + error.message);
    }
  };

  // Buscar usuario por correo
  const handleSearchUserByEmail = async () => {
    if (!formData.email) {
      setAlertMessage("Por favor, ingresa un correo válido para buscar.");
      return;
    }

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const matchedUser = usersSnapshot.docs.find(
        (doc) => doc.data().email === formData.email
      );

      if (matchedUser) {
        const userData = matchedUser.data();

        setFormData({
          displayName: userData.displayName || "",
          email: userData.email,
          birthDate: convertTimestampToDate(userData.birthDate),
          pais: userData.pais || "",
          ciudad: userData.ciudad || "",
          comuna: userData.comuna || "",
          role: "Analista",
        });

        setAlertMessage(
          "Usuario encontrado. Puedes completar los datos y guardar."
        );
      } else {
        setAlertMessage("No se encontró un usuario con ese correo.");
      }
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      setAlertMessage("Ocurrió un error al buscar el usuario.");
    }
  };

  // Eliminar trabajador
  const handleDeleteEmployee = async () => {
    try {
      if (!editingEmployee) return;
      await deleteDoc(doc(db, "employees", editingEmployee.id));
      setAlertMessage("Trabajador eliminado con éxito.");
      fetchEmployees();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error al eliminar trabajador:", error);
    }
  };

  return (
    <div className="rol-management-container">
      <h1 className="rol-management-title">Gestión de Roles y Trabajadores</h1>

      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          duration={5000}
        />
      )}

      <div className="rol-management-actions">
        <button
          className="rol-create-button"
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              displayName: "",
              email: "",
              password: "",
              birthDate: "",
              pais: "",
              ciudad: "",
              comuna: "",
              role: "Analista",
            });
            setDisplayForm(true);
          }}
        >
          Crear Trabajador
        </button>
      </div>

      <div className="rol-management-table">
        <h2 className="rol-management-subtitle">Lista de Trabajadores</h2>
        <table>
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
            {employees.length > 0 ? (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.displayName || "Sin nombre"}</td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td>
                    {employee.isAuthenticated ? (
                      <span className="authenticated">Autenticado</span>
                    ) : (
                      <span className="not-authenticated">No autenticado</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="edit-button"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setFormData({
                          displayName: employee.displayName,
                          email: employee.email,
                          password: "",
                          birthDate: employee.birthDate || "",
                          pais: employee.pais || "",
                          ciudad: employee.ciudad || "",
                          comuna: employee.comuna || "",
                          role: employee.role || "Analista",
                        });
                        setDisplayForm(true);
                      }}
                    >
                      Modificar
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => {
                        setEditingEmployee(employee);
                        setShowDeleteConfirm(true);
                      }}
                    >
                      Eliminar
                    </button>
                    {!employee.isAuthenticated && (
                      <button
                        className="authenticate-button"
                        onClick={() => handleAuthenticateEmployee(employee)}
                      >
                        Autenticar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No hay trabajadores registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3>¿Estás seguro de eliminar a este trabajador?</h3>
            <p>{editingEmployee?.displayName}</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={handleDeleteEmployee}>
                Sí, eliminar
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {displayForm && (
        <div className="modal">
          <div className="modal-content">
            <UserForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={() => {
                toast.success("¿Quieres guardar este usuario?");
                handleCreateEmployee();
                setDisplayForm(false); // Cierra el modal al guardar
              }}
              onClose={() => {
                toast.info("Operación cancelada.");
                setDisplayForm(false); // Cierra el modal al cancelar
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RolManagement;
