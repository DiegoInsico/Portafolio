// ListCollages.js

import React from 'react';
import './ListCollage.css';

const ListCollages = ({ collages, onSelectCollage, onDeleteCollage }) => {
    console.log("ListCollages recibió los siguientes collages:", collages); // Log de los collages recibidos

    if (!collages || collages.length === 0) {
        return <p>No se encontraron collages.</p>;
    }

    return (
        <div className="collages-list">
            <h3>Tus Collages</h3>
            <ul>
                {collages.map(collage => (
                    <li key={collage.id} className="collage-item">
                        <button
                            className="delete-button"
                            onClick={(e) => {
                                e.stopPropagation(); // Evita que el click se propague al li
                                onDeleteCollage(collage.id);
                            }}
                            aria-label={`Eliminar ${collage.name}`}
                        ></button>
                        <div onClick={() => onSelectCollage(collage)}>
                            <img src={collage.thumbnail} alt={collage.name} className="collage-thumbnail" />
                            <h4>{collage.name}</h4>
                            {/* Si tienes una descripción, puedes mostrarla aquí */}
                            {/* <p>{collage.description}</p> */}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListCollages;
