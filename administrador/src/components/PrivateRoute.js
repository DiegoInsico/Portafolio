import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/authContext";
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [hasAccess, setHasAccess] = useState(null); // Estado para verificar acceso
  const [loading, setLoading] = useState(true); // Estado de carga mientras se verifica

  const checkAccess = async () => {
    try {
      if (!currentUser) {
        console.warn("Usuario no autenticado.");
        return false; // Usuario no autenticado
      }

      console.log("Buscando documentos en employees con UID:", currentUser.uid);

      // Consultar documentos en employees donde el campo `id` coincide con `currentUser.uid`
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("id", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Documento encontrado en employees:", querySnapshot.docs[0].data());
        return true; // Usuario válido en employees
      }

      console.warn("No se encontró un documento válido en employees para el UID:", currentUser.uid);
      return false; // Usuario no válido
    } catch (error) {
      console.error("Error verificando acceso en employees:", error);
      return false; // Negar acceso en caso de error
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      const access = await checkAccess();
      setHasAccess(access); // Actualizar estado de acceso
      setLoading(false); // Finalizar carga
    };

    verifyAccess();
  }, [currentUser]);

  if (loading) {
    return <p>Cargando...</p>;
  }

  return hasAccess ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
