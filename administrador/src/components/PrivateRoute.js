import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async () => {
    try {
      if (!currentUser) {
        console.warn("Usuario no autenticado. UID no disponible.");
        return null;
      }

      console.log(`Buscando rol para UID: ${currentUser.uid}`);

      // Consultar Firestore para encontrar el rol en la colección employees
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("id", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0].data();
        console.log("Documento encontrado en employees:", docData);

        if (docData.role) {
          console.log(`Rol encontrado para UID ${currentUser.uid}: ${docData.role}`);
          return docData.role; // Retorna el rol si está definido
        } else {
          console.warn(`El documento para UID ${currentUser.uid} no contiene un campo 'role'.`);
          return "Sin rol"; // Sin rol asignado explícitamente
        }
      } else {
        console.warn(`No se encontró ningún documento para UID ${currentUser.uid} en employees.`);
        return null; // El UID no existe en employees
      }
    } catch (error) {
      console.error("Error al consultar el rol en Firestore:", error);
      return null; // En caso de error, no retorna rol
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      setLoading(true);
      try {
        const role = await fetchUserRole();
        setUserRole(role);

        if (role && allowedRoles.includes(role)) {
          console.log(`Acceso permitido. El rol '${role}' tiene acceso.`);
          setHasAccess(true);
        } else {
          console.warn(`Acceso denegado. El rol '${role}' no está permitido.`);
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error durante la verificación de acceso:", error);
        setHasAccess(false); // En caso de error, denegar acceso
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    verifyAccess();
  }, [currentUser, allowedRoles]);

  if (loading) {
    console.log("Cargando verificación de rol...");
    return <p>Cargando...</p>;
  }

  if (!currentUser) {
    console.warn("Usuario no autenticado. Redirigiendo a login.");
    return <Navigate to="/login" replace />;
  }

  return hasAccess ? children : <Navigate to="/dashboard" replace />;
};

export default PrivateRoute;
