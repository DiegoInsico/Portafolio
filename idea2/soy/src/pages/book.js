import React from 'react';
import './Book.css';
import { Link } from 'react-router-dom';

const Libros = () => {
  const libros = [
    {
      id: 1,
      titulo: 'Libro 1',
      imagen: 'book1.png',
    },
    {
      id: 2,
      titulo: 'Libro 2',
      imagen: 'book2.png',
    },
    {
      id: 3,
      titulo: 'Libro 3',
      imagen: 'book3.png',
    },
  ];

  return (
    <div className="libros-container">
      {libros.map(libro => (
        <Link key={libro.id} to={`/libro/${libro.id}`} className="libro">
          <img src={libro.imagen} alt={libro.titulo} />
          <h3>{libro.titulo}</h3>
        </Link>
      ))}
    </div>
  );
};

export default Libros;
