// src/App.js

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
import "leaflet/dist/leaflet.css";
import GraphicsContext from "./pages/monitor/graphics";
import Graphics from "./pages/monitor/storage/storageUsage";

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

        {/* Rutas protegidas */}
        {isAuthenticated && (
          <Route
            path="*"
            element={
              <MainLayout
                isAuthenticated={isAuthenticated}
                currentUser={currentUser}
              >
                <Routes>
                  {/* Dashboard y páginas principales */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/Alertas"
                    element={<Alertas />}
                  />
                  <Route path="/test/test" element={<Test />} />
                  <Route path="/monitor/clouster" element={<Clouster />} />
                  <Route path="/monitor/graphics" element={<GraphicsContext />} />
                  <Route
                    path="/monitor/graphs/userHeatmap"
                    element={<UserHeatmap />}
                  />
                  <Route
                    path="/monitor/storage/storageUsage"
                    element={<Graphics />}
                  />
                  <Route path="/system/notifications" element={<Notifications />} />
                  <Route
                    path="/rol/RolManagment"
                    element={<RolManagment />}/>
                  <Route path="/system/inbox" element={<Inbox />} />
                  <Route path="/ticket/:ticketId" element={<TicketDetails />} />
                </Routes>
              </MainLayout>
            }
          />
        )}

        {/* Redirección inicial según autenticación */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta por defecto */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
