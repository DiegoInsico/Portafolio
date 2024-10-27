import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, collection, query, getDocs, where } from "firebase/firestore";
import './users.css'; // Importar estilos

const UserSummary = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isVerified, setIsVerified] = useState(false);  // Estado de verificación del usuario

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setIsVerified(userDoc.data().isVerified || false);  // Verificación del estado
        } else {
          console.log("No se encontró el usuario.");
        }
      } catch (error) {
        console.error("Error obteniendo los datos del usuario:", error);
      }
    };

    const fetchSessionCount = async () => {
      try {
        const sessionsQuery = query(collection(db, "sessions"), where("userId", "==", userId));
        const sessionsSnapshot = await getDocs(sessionsQuery);
        setSessionCount(sessionsSnapshot.size);
      } catch (error) {
        console.error("Error obteniendo los inicios de sesión:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const entriesQuery = query(collection(db, "entradas"), where("userId", "==", userId));
        const entriesSnapshot = await getDocs(entriesQuery);

        const categoryCount = {};
        entriesSnapshot.forEach((doc) => {
          const category = doc.data().categoria;
          if (category) {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          }
        });

        setCategories(Object.entries(categoryCount)); // Array de categorías y su cantidad
      } catch (error) {
        console.error("Error obteniendo las categorías:", error);
      }
    };

    fetchUserData();
    fetchSessionCount();
    fetchCategories();
  }, [userId]);

  // Función para verificar al usuario
  const handleVerification = async () => {
    const userDocRef = doc(db, "users", userId);
    try {
      await updateDoc(userDocRef, {
        isVerified: true,
      });
      setIsVerified(true);  // Actualizar el estado localmente
      console.log("Usuario verificado con éxito.");
    } catch (error) {
      console.error("Error actualizando la verificación:", error);
    }
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div className="user-summary-container">
      <h1>Resumen del Usuario</h1>
      
      <div className="user-summary-content">
        {/* Columna izquierda: información del usuario */}
        <div className="user-info-column">
          <ul className="user-info">
            <li><span className="label">Nombre:</span> <span className="data">{userData.displayName}</span></li>
            <li><span className="label">Email:</span> <span className="data">{userData.email}</span></li>
            <li><span className="label">Rol:</span> <span className="data">{userData.role}</span></li>
            <li><span className="label">Fecha de creación:</span> <span className="data">{new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}</span></li>
            <li><span className="label">Inicios de sesión:</span> <span className="data">{sessionCount}</span></li>
            <li><span className="label">Categorías usadas:</span>
              <span className="data">
                {categories.length > 0 ? (
                  <ul>
                    {categories.map(([category, count]) => (
                      <li key={category}>
                        {category}: {count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  "No hay categorías registradas"
                )}
              </span>
            </li>
          </ul>
        </div>

        {/* Columna derecha: imagen de perfil */}
        <div className="profile-image-column">
          <img
            src={userData.photoURL || "https://via.placeholder.com/150?text=Avatar"}
            alt="Imagen de perfil"
            className="profile-image-rounded"
          />
          <div className="account-created">
            <p>Fecha de creación:</p>
            <p>{new Date(userData.createdAt.seconds * 1000).toLocaleDateString()}</p>
          </div>

          {/* Botón o estado de verificación */}
          <div className="verification-section">
            {isVerified ? (
              <p className="verified-label">Usuario Verificado ✅</p>
            ) : (
              <button className="verify-button" onClick={handleVerification}>
                Verificar Usuario
              </button>
            )}
          </div>
        </div>
      </div>

      <Link to="/monitor/users/userActivity" className="back-button">
        Regresar
      </Link>
    </div>
  );
};

export default UserSummary;
