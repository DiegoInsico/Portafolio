import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/home';
import LoginPage from './pages/LoginPage';
import DetalleLibro from './pages/detalleLibro';
import NavBar from './components/navBar';
import Background from './components/background';
import { auth } from './firebase'; // Asegúrate de que el archivo ./firebase tenga la configuración de Firebase y exporte 'auth'

function AnimatedRoutes({ currentUser }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={currentUser ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/libro/:id" element={<DetalleLibro />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <Router>
      <Background imageUrl="/wp9158418.jpg" /> {/* Pasa la ruta de la imagen de fondo */}
      <NavBar />
      <AnimatedRoutes currentUser={currentUser} />
    </Router>
  );
}

export default App;
