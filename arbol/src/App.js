import React from 'react';
import './App.css';
import ArbolDeArce from './page/ArbolDeArce'; // Ajusta la ruta según dónde tengas tu componente

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Aplicación del Árbol de Arce</h1>
      </header>
      <ArbolDeArce />
    </div>
  );
}

export default App;
