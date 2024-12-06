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
import AnalysisPage from "./pages/monitor/pb/pb";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = async (uid) => {
    try {
      if (!uid) {
        console.warn("UID no proporcionado.");
        return false;
      }

      console.log("Consultando Firestore para UID:", uid);
      const employeesRef = collection(db, "employees");
      const q = query(employeesRef, where("id", "==", uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log(
          "Acceso permitido. Documento encontrado:",
          querySnapshot.docs[0].data()
        );
        return true;
      } else {
        console.warn("Acceso denegado. No se encontró un documento en employees para UID:", uid);
        return false;
      }
    } catch (error) {
      console.error("Error verificando acceso:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Estado de autenticación cambiado:", user ? user.uid : "No autenticado");
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);

        const access = await checkAccess(user.uid);
        setHasAccess(access);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setHasAccess(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    console.log("Inicio de sesión exitoso:", user.uid);
    setIsAuthenticated(true);
    setCurrentUser(user);

    checkAccess(user.uid).then((access) => setHasAccess(access));
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      console.log("Usuario cerró sesión.");
      setIsAuthenticated(false);
      setCurrentUser(null);
      setHasAccess(false);
    });
  };

  if (loading) {
    console.log("Cargando estado de autenticación...");
    return <p>Cargando...</p>;
  }

  return (
    <Router>
      <Routes>
        {/* Ruta para login */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />

        {/* Estructura principal */}
        {isAuthenticated && (
          <Route
            path="*"
            element={
              <MainLayout
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              >
                <Routes>
                  {/* Rutas protegidas */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Operador"]}>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/Alertas"
                    element={
                      <PrivateRoute allowedRoles={["Administrador"]}>
                        <Alertas />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/monitor/graphics"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Analista"]}>
                        <GraphicsContext />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/monitor/pb/pb"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Analista"]}>
                        <AnalysisPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/monitor/storage/storageUsage"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Analista"]}>
                        <Graphics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/monitor/graphs/userHeatmap"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Analista"]}>
                        <UserHeatmap />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/system/inbox"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Operador"]}>
                        <Inbox />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/monitor/clouster"
                    element={
                      <PrivateRoute allowedRoles={["Administrador", "Operador"]}>
                        <Clouster />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/rol/RolManagment"
                    element={
                      <PrivateRoute allowedRoles={["Administrador"]}>
                        <RolManagment />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/test/test" element={<Test />} />
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
      </Routes>
    </Router>
  );
}

export default App;
