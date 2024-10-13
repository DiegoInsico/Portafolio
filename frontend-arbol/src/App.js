// App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import CardList from './components/CardList';
import CardDetail from './components/CardDetail';

function App() {
  const [entradas, setEntradas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/entries') // Asegúrate de que esta URL es correcta
      .then((response) => {
        setEntradas(response.data);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al obtener las entradas:', error);
        setError('No se pudieron cargar las entradas.');
        setCargando(false);
      });
  }, []);

  const handleCardClick = (entrada) => {
    setDetalle(entrada);
  };

  const closeDetail = () => {
    setDetalle(null);
  };

  return (
    <div className="App">
      <div className="background"></div>
      <div className="content">
        <h1>Mi Árbol Realista</h1>
        {cargando && <p>Cargando entradas...</p>}
        {error && <p>{error}</p>}
        {!cargando && !error && (
          <CardList entradas={entradas} onCardClick={handleCardClick} />
        )}
        {detalle && <CardDetail card={detalle} onClose={closeDetail} />}
      </div>
    </div>
  );
}

export default App;
