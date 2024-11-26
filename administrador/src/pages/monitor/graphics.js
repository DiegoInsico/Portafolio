import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import RelationCharts, { getUserContext } from "./graphs/dataService"; // Ruta hacia el archivo dataService.js
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
import { db } from "../../firebase";
import { Line } from "react-chartjs-2";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import UserContext from "./context/usercontext";
import NivelSeguridad from "./context/segEntryContext";

const Graphics = () => {

  return (
    <div className="graphics-container">
      <div className="chart-item-context">
        <h2>contexto usuarios</h2>
        <UserContext />
      </div>
      <div className="chart-item-context">
        <h2>Nivel de las entradas</h2>
        <NivelSeguridad />
      </div>

      <div className="summary">
        <h2>Resumen de Usuarios</h2>
      <RelationCharts/>
      </div>
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
    </div>
  );
};

export default Graphics;
