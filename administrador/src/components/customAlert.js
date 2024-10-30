import React from 'react';
import './customAlert.css';

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert">
      <div className="alert-content">
        <p>{message}</p>
        <button onClick={onClose}>Ok</button>
      </div>
    </div>
  );
};

export default CustomAlert;
