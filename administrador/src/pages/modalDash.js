import React from "react";

const ModalDash = ({ type, data, onClose }) => {
  return (
    <div className="modal">
      <button onClick={onClose}>Cerrar</button>
      <h1>{type}</h1>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
};

export default ModalDash;
