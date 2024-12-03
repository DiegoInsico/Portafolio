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
      console.error("Error al obtener empleados:", error.message);
    }
  };

  // Crear empleado en Firebase Authentication y Firestore
  const handleCreateEmployee = async () => {
    try {
      // Validar datos obligatorios
      if (!formData.email || !formData.role) {
        setAlertMessage("El correo y el rol son obligatorios.");
        return;
      }

      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password || "password123" // Contraseña predeterminada
      );
      const newUser = userCredential.user;

      console.log("Usuario creado en Authentication:", newUser.uid);

      // Crear documento en Firestore con el mismo UID
      const employeeRef = doc(db, "employees", newUser.uid);
      await setDoc(employeeRef, {
        ...formData,
        id: newUser.uid, // Sincronizar UID
        authId: newUser.uid, // Referencia cruzada
        isAuthenticated: true, // Indica que está autenticado
        CreationRole: Timestamp.now(),
      });

      // Mostrar mensaje de éxito
      setAlertMessage("Trabajador creado y autenticado con éxito.");
      fetchEmployees(); // Actualizar la tabla de empleados
    } catch (error) {
      console.error("Error al crear el trabajador:", error.message);
      setAlertMessage("Error al crear el trabajador: " + error.message);
    }
  };

  // Autenticar empleado y actualizar Firestore
  const handleAuthenticateEmployee = async (employee) => {
    try {
      if (!employee.email) {
        toast.error("El correo del empleado es obligatorio para autenticarlo.");
        return;
      }

      const confirmAuthentication = window.confirm(
        `¿Estás seguro de autenticar a ${employee.displayName}? Esto lo registrará en Authentication.`
      );
      if (!confirmAuthentication) return;

      // Crear usuario en Firebase Authentication
      console.log("Autenticando empleado:", employee);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        employee.email,
        "password123" // Contraseña predeterminada
      );
      const newUser = userCredential.user;

      console.log("Usuario autenticado en Firebase:", newUser.uid);

      // Actualizar Firestore con el UID como documentId
      const employeeRef = doc(db, "employees", newUser.uid);
      await setDoc(employeeRef, {
        ...employee,
        authId: newUser.uid, // Relación con Authentication
        isAuthenticated: true,
      });

      toast.success(`Empleado ${employee.displayName} autenticado con éxito.`);

      // Actualizar la tabla en el frontend
      fetchEmployees();
    } catch (error) {
      console.error("Error al autenticar al empleado:", error.message);
      toast.error(`Error al autenticar al empleado: ${error.message}`);
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
            {employees.map((employee) => (
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
                </td>
              </tr>
            ))}
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
                handleCreateEmployee();
                setDisplayForm(false); // Cerrar modal
              }}
              onClose={() => setDisplayForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RolManagement;
