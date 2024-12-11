import React, { useEffect } from "react";
import "./customAlert.css";

const CustomAlert = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

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
