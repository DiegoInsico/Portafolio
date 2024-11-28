// src/components/crudDocument/ListDocument.js

import React from "react";
import "./ListDocument.css";

const ListDocument = ({ documents, onSelect, onDelete, selectedDocumentId }) => {
    return (
        <div className="documents-list">
            {documents.map((doc) => (
                <div
                    key={doc.id}
                    className={`document-item ${selectedDocumentId === doc.id ? 'selected' : ''}`}
                    onClick={() => onSelect(doc)}
                >
                    <div className="document-info">
                        <h4>{doc.title}</h4>
                        <p>{doc.testigo}</p>
                    </div>
                    <button
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation(); // Evita que se active el onSelect al hacer clic en el botón
                            onDelete(doc);
                        }}
                    >
                        Eliminar
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ListDocument;
