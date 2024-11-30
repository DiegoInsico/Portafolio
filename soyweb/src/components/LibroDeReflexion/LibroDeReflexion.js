// src/components/LibroDeReflexion/LibroDeReflexion.js

import React, { useState, useEffect } from "react";
import "./LibroDeReflexion.css";
import {
  getEntradas,
  getReflexionesForUser,
  getUserByIdFromFirestore, // Importa la función existente
} from "../../firebase";
import { useAuth } from "../../page/auth/authContext";
import { FaCalendarAlt, FaBook, FaFilePdf } from "react-icons/fa";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LibroDeReflexionPDF from "./LibroDeReflexionPDF";

const LibroDeReflexion = () => {
  const { currentUser } = useAuth();
  const [reflexiones, setReflexiones] = useState([]);
  const [categoriasReflexiones, setCategoriasReflexiones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState({
    nombre: "Usuario",
    fechaNacimiento: "01/01/1990", // Valor por defecto
  });

  // Categorías de Reflexiones (en minúsculas)
  const categorias = ["idea", "consejo", "aprendizaje", "reflexion"];

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError("Usuario no autenticado.");
        setLoading(false);
        return;
      }

      try {
        // Obtener información del usuario
        const userData = await getUserByIdFromFirestore(currentUser.uid);
        if (userData) {
          setUsuario({
            nombre: userData.nombre || "Usuario",
            fechaNacimiento: userData.fechaNacimiento
              ? userData.fechaNacimiento.toDate().toLocaleDateString()
              : "Desconocida",
          });
        }

        // Obtener todas las entradas del usuario
        const entradas = await getEntradas(currentUser.uid);

        // Obtener reflexiones para cada entrada y asociar nickname
        const todasReflexiones = [];
        for (const entrada of entradas) {
          const reflexionesEntrada = await getReflexionesForUser(
            currentUser.uid,
            entrada.id
          );

          // Asociar nickname de la entrada a cada reflexión
          const reflexionesConNickname = reflexionesEntrada.map((reflexion) => ({
            ...reflexion,
            nickname: entrada.nickname || "Usuario", // Asignar un valor predeterminado si no existe
          }));

          todasReflexiones.push(...reflexionesConNickname);
        }

        setReflexiones(todasReflexiones);

        // Categorizar las reflexiones
        const categoriasMap = {};
        categorias.forEach((categoria) => {
          categoriasMap[categoria] = [];
        });

        todasReflexiones.forEach((reflexion) => {
          const categoria = reflexion.categoria.toLowerCase() || "reflexion"; // Asegurar minúsculas
          if (categoriasMap[categoria]) {
            categoriasMap[categoria].push(reflexion);
          } else {
            categoriasMap["reflexion"].push(reflexion);
          }
        });

        setCategoriasReflexiones(categoriasMap);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("Error al obtener los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <>
      {/* Botón Flotante para Descargar PDF */}
      <PDFDownloadLink
        document={<LibroDeReflexionPDF usuario={usuario} categoriasReflexiones={categoriasReflexiones} />}
        fileName="Libro_de_Reflexion.pdf"
        className="lr-pdf-button-float"
      >
        {({ loading }) =>
          loading ? (
            "Generando PDF..."
          ) : (
            <>
              <FaFilePdf className="pdf-icon" /> Descargar Libro
            </>
          )
        }
      </PDFDownloadLink>

      {/* Contenedor Principal con Scroll */}
      <div className="lr-scroll-container">
        {/* Sección Hero */}
        <section className="lr-section">
          <div className="lr-hero-section">
            <div className="lr-hero-section-left">
              <h1>Libro</h1>
              <h1>de Reflexión</h1>
            </div>
            <div className="lr-hero-section-right">
              <p>
                Explora tus reflexiones organizadas en categorías, profundizando en
                tus pensamientos y experiencias.
              </p>
            </div>
          </div>
        </section>

        {/* Secciones por Categoría */}
        {loading ? (
          <section className="lr-section">
            <p className="lr-loading">Cargando reflexiones...</p>
          </section>
        ) : error ? (
          <section className="lr-section">
            <p className="lr-error">{error}</p>
          </section>
        ) : reflexiones.length === 0 ? (
          <section className="lr-section">
            <p className="lr-no-reflexiones">No hay reflexiones para mostrar.</p>
          </section>
        ) : (
          categorias.map((categoria) => (
            <section key={categoria} className="lr-section lr-categoria-section">
              <h2 className="lr-categoria-title">
                <FaBook className="lr-icon" />{" "}
                {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
              </h2>
              {categoriasReflexiones[categoria].length === 0 ? (
                <p className="lr-no-reflexiones">
                  No hay reflexiones en esta categoría.
                </p>
              ) : (
                <div className="lr-reflexiones-list">
                  {categoriasReflexiones[categoria].map((reflexion) => (
                    <div key={reflexion.id} className="lr-reflexion-item">
                      {/* Nickname */}
                      <div className="lr-reflexion-nickname">
                        {reflexion.nickname || "Usuario"}
                      </div>
                      {/* Header con fecha */}
                      <div className="lr-reflexion-header">
                        <FaCalendarAlt className="lr-icon" />
                        <span className="lr-fecha">
                          {reflexion.fecha
                            ? new Date(reflexion.fecha).toLocaleDateString()
                            : "Fecha desconocida"}
                        </span>
                      </div>
                      {/* Texto de la Reflexión */}
                      <p className="lr-reflexion-texto">"{reflexion.texto}"</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </>
  );
};

export default LibroDeReflexion;
