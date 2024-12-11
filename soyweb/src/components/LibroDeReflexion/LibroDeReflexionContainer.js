// src/components/LibroDeReflexion/LibroDeReflexionContainer.js

import React, { useEffect, useState } from "react";
import LibroDeReflexionPDF from "./LibroDeReflexionPDF";
import { getUserByIdFromFirestore, getReflexionesForUser, getEntradas } from "../../firebase"; // Asegúrate de importar correctamente tus funciones de Firebase
import { useAuth } from "../../page/auth/authContext";

const LibroDeReflexionContainer = () => {
  const { currentUser } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [categoriasReflexiones, setCategoriasReflexiones] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            nombre: userData.displayName || "Usuario",
            fechaNacimiento: userData.birthDate
              ? userData.birthDate.toDate().toLocaleDateString()
              : "Desconocida",
          });
        }

        // Obtener todas las entradas del usuario
        const entradas = await getEntradas(currentUser.uid);

        // Obtener reflexiones para cada entrada y asociar nickname
        const todasReflexiones = [];
        for (const entrada of entradas) {
          const reflexionesEntrada = await getReflexionesForUser(currentUser.uid, entrada.id);
          reflexionesEntrada.forEach((reflexion) => {
            todasReflexiones.push({
              ...reflexion,
              nickname: entrada.nickname || "Usuario",
            });
          });
        }

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
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setError("Error al obtener los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) return <p>Cargando datos...</p>;
  if (error) return <p>{error}</p>;
  if (!usuario) return <p>No hay información del usuario.</p>;

  return <LibroDeReflexionPDF usuario={usuario} categoriasReflexiones={categoriasReflexiones} />;
};

export default LibroDeReflexionContainer;
