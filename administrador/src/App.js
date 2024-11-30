import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Alertas from "./pages/Alertas";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/MainLayout";
import { auth } from "./firebase";
import Notifications from "./pages/system/notifications";
import Inbox from "./pages/system/inbox";
import Test from "./pages/test/test";
import Clouster from "./pages/monitor/clouster";
import PrivateRoute from "./components/PrivateRoute";
import TicketDetails from "./pages/system/TicketDetails";
import RolManagment from "./pages/rol/rolManagment";
import UserHeatmap from "./pages/monitor/graphs/userHeatmap";
import GraphicsContext from "./pages/monitor/graphics";
import Graphics from "./pages/monitor/storage/storageUsage";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "leaflet/dist/leaflet.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = async (uid) => {
    try {
      if (!uid) {
        console.warn("UID no proporcionado.");
        return false; // UID no disponible
      }

      console.log("Consultando Firestore para UID:", uid); // Debug
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("id", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Acceso permitido. Documento encontrado:", querySnapshot.docs[0].data()); // Debug
        return true;
      } else {
        console.warn("Acceso denegado. No se encontró un documento en employees para UID:", uid); // Debug
        return false;
      }
    } catch (error) {
      console.error("Error verificando acceso:", error);
      return false; // En caso de error, denegar acceso
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Estado de autenticación cambiado:", user ? user.uid : "No autenticado"); // Debug
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);

        // Verificar si el usuario pertenece a `employees`
        const access = await checkAccess(user.uid);
        setHasAccess(access);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setHasAccess(false);
      }
      setLoading(false); // Validación completa
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    console.log("Inicio de sesión exitoso:", user.uid); // Debug
    setIsAuthenticated(true);
    setCurrentUser(user);

    // Validar acceso después del login
    checkAccess(user.uid).then((access) => setHasAccess(access));
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log("Usuario cerró sesión."); // Debug
      setIsAuthenticated(false);
      setCurrentUser(null);
      setHasAccess(false);
    });
  };

  if (loading) {
    console.log("Cargando estado de autenticación..."); // Debug
    return <p>Cargando...</p>; // Mostrar mientras se verifica el acceso
  }

  return (
    <Router>
      <Routes>
        {/* Ruta para login */}
        <Route
          path="/login"
          element={
            isAuthenticated && hasAccess ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Redirección inicial según autenticación */}
        <Route
          path="/"
          element={
            isAuthenticated && hasAccess ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Rutas protegidas */}
        {isAuthenticated && hasAccess && (
          <Route
            path="*"
            element={
              <MainLayout
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              >
                <Routes>
                  {/* Dashboard y páginas principales */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/Alertas" element={<Alertas />} />
                  <Route path="/test/test" element={<Test />} />
                  <Route path="/monitor/clouster" element={<Clouster />} />
                  <Route
                    path="/monitor/graphics"
                    element={<GraphicsContext />}
                  />
                  <Route
                    path="/monitor/graphs/userHeatmap"
                    element={<UserHeatmap />}
                  />
                  <Route
                    path="/monitor/storage/storageUsage"
                    element={<Graphics />}
                  />
                  <Route
                    path="/system/notifications"
                    element={<Notifications />}
                  />
                  <Route path="/rol/RolManagment" element={<RolManagment />} />
                  <Route path="/system/inbox" element={<Inbox />} />
                  <Route path="/ticket/:ticketId" element={<TicketDetails />} />
                </Routes>
              </MainLayout>
            }
          />
        )}

        {/* Manejo de rutas no autorizadas */}
        {!hasAccess && (
          <Route
            path="*"
            element={
              <Navigate to="/login" replace state={{ error: "No autorizado" }} />
            }
          />
        )}

        {/* Ruta por defecto */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated && hasAccess ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
