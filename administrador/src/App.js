import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import GestionUsuarios from "./pages/GestionUsuarios";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/MainLayout";
import { auth } from "./firebase";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AppRoutes currentUser={currentUser} />
    </Router>
  );
}

// Mover el uso de useLocation dentro del componente AppRoutes que está bajo Router
const AppRoutes = ({ currentUser }) => {
  const location = useLocation();

  // Condicional para determinar si mostramos el MainLayout o no
  const showMainLayout = location.pathname !== "/login";

  return (
    <>
      {showMainLayout ? (
        <MainLayout currentUser={currentUser}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
          </Routes>
        </MainLayout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      )}
    </>
  );
};

export default App;
