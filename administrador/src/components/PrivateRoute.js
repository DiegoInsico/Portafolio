import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { collection, getDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta según tu configuración

const PrivateRoute = ({ children, currentUser }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "usuarios", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.isAdmin === true);
      }
      setLoading(false);
    }

    checkAdminStatus();
  }, [currentUser]);

  if (loading) {
    return <div>Loading...</div>; // Puedes reemplazar esto con un spinner o un componente de carga
  }

  return isAdmin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
