import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './ArbolDeArce.css';

const ArbolDeArce = () => {
  const [entradas, setEntradas] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const obtenerEntradas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'entradas'));
        const entradasObtenidas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEntradas(entradasObtenidas);
      } catch (error) {
        console.error('Error al obtener entradas: ', error);
      }
    };

    obtenerEntradas();
  }, []);

  const handleHojaClick = (entrada) => {
    setSelectedEntry(entrada);
  };

  // Define las áreas donde las hojas pueden aparecer (solo sobre las ramas)
  const obtenerCoordenadasRama = () => {
    const ramas = [
      { topMin: 20, topMax: 30, leftMin: 30, leftMax: 40 }, // Rama 1
      { topMin: 40, topMax: 50, leftMin: 50, leftMax: 60 }, // Rama 2
      { topMin: 60, topMax: 70, leftMin: 20, leftMax: 30 }, // Rama 3
      { topMin: 35, topMax: 45, leftMin: 60, leftMax: 70 }, // Rama 4
    ];
    const ramaSeleccionada = ramas[Math.floor(Math.random() * ramas.length)];
    const top = Math.random() * (ramaSeleccionada.topMax - ramaSeleccionada.topMin) + ramaSeleccionada.topMin;
    const left = Math.random() * (ramaSeleccionada.leftMax - ramaSeleccionada.leftMin) + ramaSeleccionada.leftMin;
    return { top, left };
  };

  return (
    <div className="arbol-container">
      <h2>Bienvenido a tu Árbol de Arce</h2>
      <div id="arbol">
        {entradas.map((entrada) => {
          const { top, left } = obtenerCoordenadasRama();
          return (
            <div
              key={entrada.id}
              className="hoja"
              style={{
                top: `${top}%`,
                left: `${left}%`,
              }}
              title={`Entrada ${entrada.id}: ${entrada.texto || 'Sin contenido'}`}
              onClick={() => handleHojaClick(entrada)}
            ></div>
          );
        })}
      </div>
      <div className="contador">
        <p>Entradas: {entradas.length}</p>
        <p>Hojas en el árbol: {entradas.length}</p>
      </div>

      {selectedEntry && (
        <div className="modal">
          <div className="modal-content">
            <h3>Entrada: {selectedEntry.id}</h3>
            <p>{selectedEntry.texto}</p>
            <button onClick={() => setSelectedEntry(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArbolDeArce;
