import React from "react";
import ReactModal from "react-modal";

ReactModal.setAppElement("#root");

const Modal = ({ isOpen, onClose, content }) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <button onClick={onClose} className="modal-close">
        X
      </button>
      <div className="modal-content">
        <h3>Detalles del Gráfico</h3>
        <p>{content}</p>
      </div>
    </ReactModal>
  );
};

export default Modal;
