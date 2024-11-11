import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Entradas from "./pages/Entradas";
import GestionUsuarios from "./pages/GestionUsuarios";
import Graphics from "./pages/monitor/graphics";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/MainLayout";
import { auth } from "./firebase";
import UserActivity from "./pages/monitor/users/userActivity";
import UsageCharts from "./pages/monitor/graphs/usageCharts";
import StorageUsage from "./pages/monitor/storage/storageUsage";
import UserSummary from "./pages/monitor/users/userSummary";
import Notifications from "./pages/system/notifications";
import SoulmatePage from "./pages/monitor/soulmatePage";
import Inbox from "./pages/system/inbox";
import Test from "./pages/test/test";
import Clouster from "./pages/monitor/clouster";
import RightBar from "./components/rightBar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  return (
    <Router>
      <AppRoutes 
        isAuthenticated={isAuthenticated} 
        currentUser={currentUser} 
        handleLogin={handleLogin} 
      />
    </Router>
  );
}

const AppRoutes = ({ isAuthenticated, currentUser, handleLogin }) => {
  return (
    <MainLayout isAuthenticated={isAuthenticated} currentUser={currentUser}>
      {isAuthenticated && <RightBar />}  {/* Añade esta línea */}
      <Routes>
        {/* Ruta de Login */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Rutas Protegidas */}
        {isAuthenticated ? (
          <>
            {/* pagina de testeo */}
            <Route path="/Test" element={<Test />} />
            <Route path="/monitor/clouster" element={<Clouster />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
            
            {/* Gráficos */}
            <Route path="/monitor/graphics" element={<Graphics />} />
            <Route path="/monitor/graphs/usageCharts" element={<UsageCharts />} />
            
            {/* Almacenamiento y Sistema */}
            <Route path="/monitor/storage/storageUsage" element={<StorageUsage />} />
            <Route path="/system/notifications" element={<Notifications />} />
            <Route path="/system/inbox" element={<Inbox />} />
            
            {/* Usuarios */}
            <Route path="/monitor/users/userActivity" element={<UserActivity />} />
            <Route path="/monitor/users/userSummary/:userId" element={<UserSummary />} />
            <Route path="/monitor/SoulmatePage" element={<SoulmatePage />} />
          </>
        ) : (
          // Redirige a Login si no está autenticado
          <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
        )}
        
        {/* Redirigir al login en caso de que la ruta principal no esté autenticado */}
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <LoginPage onLogin={handleLogin} />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
