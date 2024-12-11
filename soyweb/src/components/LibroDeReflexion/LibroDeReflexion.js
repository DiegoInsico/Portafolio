// src/components/LibroDeReflexion/LibroDeReflexion.js

import React, { useState, useEffect, useMemo } from "react";
import "./LibroDeReflexion.css";
import {
  getEntradas,
  getReflexionesForUser,
  getUserByIdFromFirestore,
} from "../../firebase";
import { useAuth } from "../../page/auth/authContext";
import { FaCalendarAlt, FaBook } from "react-icons/fa";
import LibroDeReflexionPDF from "./LibroDeReflexionPDF";


const LibroDeReflexion = () => {
  const { currentUser } = useAuth();
  const [reflexiones, setReflexiones] = useState([]);
  const [categoriasReflexiones, setCategoriasReflexiones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuario, setUsuario] = useState({
    nombre: "Usuario",
    fechaNacimiento: "Desconocida",
  });

  // Categorías de Reflexiones (en minúsculas)
  const categorias = ["idea", "consejo", "aprendizaje", "reflexion"];

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setError("Usuario no autenticado.");
        setLoading(false);
        console.log("Usuario no autenticado.");
        return;
      }

      try {
        // Obtener información del usuario
        const userData = await getUserByIdFromFirestore(currentUser.uid);
        console.log("Datos del usuario obtenidos:", userData);
        if (userData) {
          setUsuario({
            nombre: userData.displayName || "Usuario",
            fechaNacimiento: userData.birthDate
              ? userData.birthDate.toDate().toLocaleDateString()
              : "Desconocida",
          });
        }

        // Obtener todas las entradas del usuario
        const entradas = await getEntradas(currentUser.uid);
        console.log("Entradas obtenidas:", entradas);

        // Obtener reflexiones para cada entrada y asociar nickname
        const todasReflexiones = [];
        for (const entrada of entradas) {
          const reflexionesEntrada = await getReflexionesForUser(
            currentUser.uid,
            entrada.id
          );
          console.log(
            `Reflexiones obtenidas para entrada ${entrada.id}:`,
            reflexionesEntrada
          );

          // Asociar nickname de la entrada a cada reflexión y procesar fecha
          const reflexionesConNickname = reflexionesEntrada.map((reflexion) => {
            console.log("Procesando reflexión:", reflexion);
            let fechaString = "Fecha desconocida";

            if (reflexion.fecha) {
              if (typeof reflexion.fecha.toDate === "function") {
                // Firestore Timestamp
                fechaString = reflexion.fecha.toDate().toLocaleDateString();
              } else if (reflexion.fecha instanceof Date) {
                // JavaScript Date
                fechaString = reflexion.fecha.toLocaleDateString();
              } else if (typeof reflexion.fecha === "string") {
                // String, intentar convertir a Date
                const fechaDate = new Date(reflexion.fecha);
                if (!isNaN(fechaDate)) {
                  fechaString = fechaDate.toLocaleDateString();
                }
              }
            }

            return {
              ...reflexion,
              nickname: entrada.nickname || "Usuario",
              fechaString,
            };
          });

          todasReflexiones.push(...reflexionesConNickname);
        }

        setReflexiones(todasReflexiones);
        console.log("Todas las reflexiones:", todasReflexiones);

        // Categorizar las reflexiones
        const categoriasMap = {};
        categorias.forEach((categoria) => {
          categoriasMap[categoria] = [];
        });

        todasReflexiones.forEach((reflexion) => {
          const categoria = reflexion.categoria?.toLowerCase() || "reflexion";
          if (categoriasMap[categoria]) {
            categoriasMap[categoria].push(reflexion);
          } else {
            categoriasMap["reflexion"].push(reflexion);
          }
        });

        setCategoriasReflexiones(categoriasMap);
        console.log("Categorías de reflexiones:", categoriasMap);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("Error al obtener los datos.");
      } finally {
        setLoading(false);
        console.log("Carga de datos finalizada.");
      }
    };

    fetchData();
  }, [currentUser]);

  // Memoizar las reflexiones para optimizar la generación del PDF
  const memoizedReflexiones = useMemo(() => reflexiones, [reflexiones]);

  return (
    <>
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
                Explora tus reflexiones organizadas en categorías, profundizando
                en tus pensamientos y experiencias.
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
            <p className="lr-no-reflexiones">
              No hay reflexiones para mostrar.
            </p>
          </section>
        ) : (
          categorias.map((categoria, index) => (
            <section
              key={`${categoria}-${index}`} // Clave única combinando categoria e index
              className="lr-section lr-categoria-section"
            >
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
                  {categoriasReflexiones[categoria].map((reflexion, idx) => (
                    <div
                      key={`${reflexion.id}-${idx}`} // Clave única combinando id e index
                      className="lr-reflexion-item"
                    >
                      {/* Nickname */}
                      <div className="lr-reflexion-nickname">
                        {reflexion.nickname || "Usuario"}
                      </div>
                      {/* Header con fecha */}
                      <div className="lr-reflexion-header">
                        <FaCalendarAlt className="lr-icon" />
                        <span className="lr-fecha">
                          {reflexion.fechaString
                            ? reflexion.fechaString
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

        {/* Sección para el PDF */}
        <section className="lr-section-pdf">
          <LibroDeReflexionPDF
            usuario={usuario}
            categoriasReflexiones={categoriasReflexiones}
          />
        </section>
      </div>
    </>
  );
};

export default LibroDeReflexion;
