import React from "react";
import "./customAlert.css";

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert-container" role="alert" aria-live="assertive">
      <div className="custom-alert">
        <p className="custom-alert-message">{message}</p>
        <button onClick={onClose} className="custom-alert-button">
          Ok
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
