import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./export.css"; // Asegúrate de tener este archivo de estilos

const ExportPagesi = () => {
  // Función para mostrar un mensaje de alerta
  const handleExportPDF = () => {
    toast.info("Exportación de PDF próximamente...", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleExportExcel = () => {
    toast.info("Exportación de Excel próximamente...", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className="export-container">
      <h1 className="export-title">Exportar Informe</h1>
      <h2 className="export-sub">evidencia en src/pages/utils/</h2>

      <div className="export-actions">
        <button className="export-button" onClick={handleExportPDF}>
          Exportar a PDF
        </button>
        <button className="export-button" onClick={handleExportExcel}>
          Exportar a Excel
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ExportPagesi;
