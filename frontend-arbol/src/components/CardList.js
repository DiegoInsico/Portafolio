// components/CardList.js
import React from 'react';
import Card from './Card';
import './CardList.css';

function CardList({ entradas, onCardClick }) {
  return (
    <div className="card-list">
      {entradas.map((entrada) => (
        <Card key={entrada.id} card={entrada} onClick={() => onCardClick(entrada)} />
      ))}
    </div>
  );
}

export default CardList;
