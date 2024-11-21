import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

const PrivateRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          const isAdmin = docSnap.exists() && docSnap.data().role === "admin";
          setAuthStatus({ isAuthenticated: true, isAdmin, loading: false });
        } catch (error) {
          console.error("Error al verificar el rol del usuario:", error);
          setAuthStatus({ isAuthenticated: false, isAdmin: false, loading: false });
        }
      } else {
        setAuthStatus({ isAuthenticated: false, isAdmin: false, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  if (authStatus.loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!authStatus.isAuthenticated || !authStatus.isAdmin) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
