import React, { useEffect, useState } from "react";
import { getUserContext } from "./graphs/dataService"; // Ruta hacia el archivo dataService.js
import BeneficiariosChart from "./graphs/beneficiarios";
import CertificadosChart from "./graphs/certificados";
import DocumentosChart from "./graphs/documentos";
import UsuariosChart from "./graphs/usuarios";

import "./graphics.css"; // Opcional: estilos adicionales
import EntradasChart from "./graphs/entradas";
import MensajesProgramadosChart from "./graphs/mensajesprogramados";
import SesionesChart from "./graphs/sesiones";
import TicketsChart from "./graphs/tickets";
import TestigosChart from "./graphs/testigos";

const Graphics = () => {
  const [userContext, setUserContext] = useState([]);

  useEffect(() => {
    async function fetchContext() {
      const context = await getUserContext();
      setUserContext(context);
    }
    fetchContext();
  }, []);

  return (
    <div className="graphics-container">
      <div className="chart-item">
        <h2>Beneficiarios</h2>
        <BeneficiariosChart />
      </div>
      <div className="chart-item">
        <h2>Certificados</h2>
        <CertificadosChart />
      </div>
      <div className="chart-item">
        <h2>Documentos</h2>
        <DocumentosChart />
      </div>
      <div className="chart-item">
        <h2>Usuarios</h2>
        <UsuariosChart />
      </div>
      <div className="chart-item">
        <h2>entradas</h2>
        <EntradasChart />
      </div>
      <div className="chart-item">
        <h2>entradas</h2>
        <MensajesProgramadosChart />
      </div>
      <div className="chart-item">
        <h2>Sesiones</h2>
        <SesionesChart />
      </div>
      <div className="chart-item">
        <h2>Tickets</h2>
        <TicketsChart />
      </div>
      <div className="chart-item">
        <h2>Testigos</h2>
        <TestigosChart />
      </div>

      <div className="summary">
        <h2>Resumen de Usuarios</h2>
        {userContext.length > 0 ? (
          <ul>
            {userContext.map((summary, index) => (
              <li key={index}>{summary}</li>
            ))}
          </ul>
        ) : (
          <p>Cargando resumen...</p>
        )}
      </div>
    </div>
  );
};

export default Graphics;
