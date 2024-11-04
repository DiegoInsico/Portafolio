import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  where,
} from "firebase/firestore";
import "./users.css";
import Container from "../../../components/container";

const UserSummary = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setIsVerified(userDoc.data().isVerified || false);
        } else {
          console.log("No se encontró el usuario.");
        }
      } catch (error) {
        console.error("Error obteniendo los datos del usuario:", error);
      }
    };

    const fetchSessionHistory = async () => {
      try {
        const sessionsQuery = query(
          collection(db, "sessions"),
          where("userId", "==", userId)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        const history = sessionsSnapshot.docs.map(
          (doc) => doc.data().timestamp
        );
        setSessionHistory(history);
      } catch (error) {
        console.error("Error obteniendo el historial de sesiones:", error);
      }
    };

    const fetchCategories = async () => {
      try {
        const entriesQuery = query(
          collection(db, "entradas"),
          where("userId", "==", userId)
        );
        const entriesSnapshot = await getDocs(entriesQuery);

        const categoryCount = {};
        entriesSnapshot.forEach((doc) => {
          const category = doc.data().categoria;
          if (category) {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          }
        });

        setCategories(Object.entries(categoryCount));
      } catch (error) {
        console.error("Error obteniendo las categorías:", error);
      }
    };

    fetchUserData();
    fetchSessionHistory();
    fetchCategories();
  }, [userId]);

  const handleVerification = async () => {
    const userDocRef = doc(db, "users", userId);
    try {
      await updateDoc(userDocRef, {
        isVerified: true,
      });
      setIsVerified(true);
      console.log("Usuario verificado con éxito.");
    } catch (error) {
      console.error("Error actualizando la verificación:", error);
    }
  };

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <Container>
      <div className="user-summary-container">
        <h1>Resumen del Usuario</h1>

        <div className="user-summary-content">
          <div className="user-info-column">
            <ul className="user-info">
              <li>
                <span className="label">Nombre:</span>{" "}
                <span className="data">{userData.displayName}</span>
              </li>
              <li>
                <span className="label">Email:</span>{" "}
                <span className="data">{userData.email}</span>
              </li>
              <li>
                <span className="label">Rol:</span>{" "}
                <span className="data">{userData.role}</span>
              </li>
              <li>
                <span className="label">Fecha de creación:</span>{" "}
                <span className="data">
                  {new Date(
                    userData.createdAt.seconds * 1000
                  ).toLocaleDateString()}
                </span>
              </li>
              <li>
                <span className="label">Inicios de sesión:</span>{" "}
                <span className="data">{sessionHistory.length}</span>
              </li>
              <li>
                <span className="label">Categorías usadas:</span>
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

          <div className="profile-image-column">
            <img
              src={
                userData.photoURL ||
                "https://via.placeholder.com/150?text=Avatar"
              }
              alt="Imagen de perfil"
              className="profile-image-rounded"
            />
            <div className="account-created">
              <p>Fecha de creación:</p>
              <p>
                {new Date(
                  userData.createdAt.seconds * 1000
                ).toLocaleDateString()}
              </p>
            </div>

            <div className="verification-section">
              {isVerified ? (
                <p className="verified-label">Usuario Verificado ✅</p>
              ) : (
                <button className="verify-button" onClick={handleVerification}>
                  Verificar Usuario
                </button>
              )}
            </div>

            {/* Historial de sesiones */}
            <div className="session-history">
              <h3>Historial de Inicios de Sesión</h3>
              {sessionHistory.length > 0 ? (
                <ul>
                  {sessionHistory.map((timestamp, index) => (
                    <li key={index}>
                      {new Date(timestamp.seconds * 1000).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay sesiones registradas</p>
              )}
            </div>
          </div>
        </div>

        <Link to="/monitor/users/userActivity" className="back-button">
          Regresar
        </Link>
      </div>
    </Container>
  );
};

export default UserSummary;
