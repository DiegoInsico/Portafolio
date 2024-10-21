// src/pages/Entradas.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Entradas.css"; // Archivo de estilos

const Entradas = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const entriesList = entriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(entriesList);
    };

    fetchEntries();
  }, []);

  return (
    <div className="entradas-container">
      <h1>Lista de Entradas</h1>
      <ul className="entries-list">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <li key={entry.id} className="entry-item">
              <div className="entry-header">
                <strong>{entry.texto || "Sin título"}</strong>
                <span>
                  {new Date(entry.fechaCreacion.seconds * 1000).toLocaleString()}
                </span>
              </div>
              <p className="entry-category">Categoría: {entry.categoria || "Sin categoría"}</p>
            </li>
          ))
        ) : (
          <p>No hay entradas disponibles.</p>
        )}
      </ul>
    </div>
  );
};

export default Entradas;
