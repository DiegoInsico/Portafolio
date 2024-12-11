import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import TopBar from "./TopBar";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./mainLayout.css";

const MainLayout = ({ children, isAuthenticated, currentUser }) => {
  const [userRole, setUserRole] = useState(null); // Rol del usuario
  const [userDetails, setUserDetails] = useState(null); // Información del usuario

  // Obtener detalles del usuario desde Firebase
  const fetchUserRole = async () => {
    if (currentUser) {
      try {
        const employeesRef = collection(db, "employees");
        const q = query(employeesRef, where("id", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const data = querySnapshot.docs[0].data();
          console.log("Detalles del usuario obtenidos:", data);
          setUserRole(data.role || "Sin rol");
          setUserDetails(data);
        } else {
          console.warn("No se encontró el usuario en la base de datos.");
          setUserRole("Sin rol");
          setUserDetails(null);
        }
      } catch (error) {
        console.error("Error al obtener el rol del usuario:", error);
      }
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [currentUser]);

  const handleLogout = () => {
    auth.signOut().catch((error) => {
      console.error("Error al cerrar sesión:", error.message);
    });
  };

  return (
    <div className="main-layout">
      <div className="main-layout-container">
        {isAuthenticated ? (
          <>
            {/* Barra superior */}
            <TopBar
              currentUser={{ ...currentUser, ...userDetails }}
              userRole={userRole}
              handleLogout={handleLogout}
            />
            {/* Contenido principal */}
            <main className="main-layout-content">{children}</main>
          </>
        ) : (
          <div className="main-layout-login-wrapper">{children}</div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
