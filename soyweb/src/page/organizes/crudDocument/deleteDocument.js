

import React from "react";
import "./DeleteDocument.css";

const ConfirmDeleteModal = ({ document, onConfirm, onCancel }) => {
    return (
        <div className="delete-modal-overlay">
            <div className="delete-modal-content">
                <h2>Eliminar Documento</h2>
                <p>
                    ¿Estás seguro de que deseas eliminar el documento <strong>{document.title}</strong>?
                    Esta acción no se puede deshacer.
                </p>
                <div className="delete-modal-actions">
                    <button className="confirm-button" onClick={onConfirm}>
                        Confirmar
                    </button>
                    <button className="cancel-button" onClick={onCancel}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
