import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import RelationCharts, { getUserContext } from "./../graphs/dataService"; // Ruta hacia el archivo dataService.js
import BeneficiariosChart from "./../graphs/beneficiarios";
import CertificadosChart from "./../graphs/certificados";
import DocumentosChart from "./../graphs/documentos";
import UsuariosChart from "./../graphs/usuarios";

import "./storage.css"; // Opcional: estilos adicionales
import EntradasChart from "./../graphs/entradas";
import MensajesProgramadosChart from "./../graphs/mensajesprogramados";
import SesionesChart from "./../graphs/sesiones";
import TicketsChart from "./../graphs/tickets";
import TestigosChart from "./../graphs/testigos";

import "react-datepicker/dist/react-datepicker.css";
import Music from "../graphs/music";
import Info from "../context/info";

const Graphics = () => {

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
      {/* <div className="chart-item">
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
      <div className="chart-item">
        <h2>muscia</h2>
        <Music />
      </div>
      <div className="chart-item">
        <h2>info</h2>
        <Info />
      </div> */}
    </div>
  );
};

export default Graphics;
