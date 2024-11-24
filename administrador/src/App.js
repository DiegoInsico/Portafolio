// src/App.js

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import GestionUsuarios from "./pages/GestionUsuarios";
import Graphics from "./pages/monitor/graphics";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/MainLayout";
import { auth } from "./firebase";
import StorageUsage from "./pages/monitor/storage/storageUsage";
import Notifications from "./pages/system/notifications";
import SoulmatePage from "./pages/monitor/soulmatePage";
import Inbox from "./pages/system/inbox";
import Test from "./pages/test/test";
import Clouster from "./pages/monitor/clouster";
import PrivateRoute from "./components/PrivateRoute";
import TicketDetails from "./pages/system/TicketDetails";
import RolManagment from "./pages/rol/rolManagment";
import UserHeatmap from "./pages/monitor/graphs/userHeatmap";
import "leaflet/dist/leaflet.css";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("currentUser");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("currentUser");
    });
  };
  return (
    <Router>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

const AppRoutes = ({
  isAuthenticated,
  currentUser,
  handleLogin,
  handleLogout,
}) => {
  return (
    <MainLayout isAuthenticated={isAuthenticated} currentUser={currentUser}>
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Rutas Protegidas */}
        {isAuthenticated ? (
          <>
            {/* Página de Testeo */}
            <Route path="/Test" element={<Test />} />
            <Route path="/monitor/clouster" element={<Clouster />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />

            {/* Gráficos */}
            <Route path="/monitor/graphics" element={<Graphics />} />
            <Route path="/monitor/graphs/userHeatmap" element={<UserHeatmap />} />

            {/* Almacenamiento y Sistema */}
            <Route
              path="/monitor/storage/storageUsage"
              element={<StorageUsage />}
            />
            <Route path="/system/notifications" element={<Notifications />} />
            <Route path="/rol/RolManagment" element={<RolManagment />} />

            {/* Ruta Protegida con PrivateRoute para Soporte */}
            <Route path="/system/inbox" element={<Inbox />} />


            <Route path="/ticket/:ticketId" element={<TicketDetails />} />

            <Route path="/monitor/SoulmatePage" element={<SoulmatePage />} />
          </>
        ) : (
          // Redirige a Login si no está autenticado
          <Route path="*" element={<Navigate to="/login" />} />
        )}

        {/* Redirigir al login en caso de que la ruta principal no esté autenticado */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </MainLayout>
  );
};

export default App;
