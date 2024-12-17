// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './page/home/home';
import Prueba from './page/prueba';
import AlbumPage from './page/album/pageAlbum';
import DocumentManager from './page/organizes/pageOrganize';
import LoginPage from './page/auth/login';
import RegisterPage from './page/auth/register';
import ProtectedRoute from './components/protectedRoute';
import LineaDeTiempo from './page/history/LineaDeTiempo';
import Mensajes from './components/Mensajes/Mensajes';
import HastaPronto from './components/HastaPronto/HastaPronto'; // Importar el componente HastaPronto
import LibroDeReflexion from './components/LibroDeReflexion/LibroDeReflexion'; // Importar el nuevo componente
import { AuthProvider } from './page/auth/authContext';
import Navbar from './components/NavBar/navBar';
import "./App.css";

const ProtectedLayout = ({ children }) => (
  <div className="protected-layout">
    <Navbar />
    {children}
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prueba"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Prueba />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/album"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AlbumPage />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/organize"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <DocumentManager />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          {/* Nueva ruta para Línea de Tiempo */}
          <Route
            path="/linea-tiempo"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LineaDeTiempo />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          {/* Ruta protegida para Mensajes */}
          <Route
            path="/mensajes"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Mensajes />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          {/* Rutas para Hasta Pronto */}
          <Route
            path="/hasta-pronto/mis-despedidas"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <HastaPronto tipo="mis-despedidas" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hasta-pronto/despedidas-asignadas"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <HastaPronto tipo="despedidas-asignadas" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
          {/* Ruta para Libro de Reflexión */}
          <Route
            path="/libro-de-reflexion"
            element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <LibroDeReflexion tipo="libro-de-reflexion" />
                </ProtectedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
