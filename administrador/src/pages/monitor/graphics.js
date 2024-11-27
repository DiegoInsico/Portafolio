import React from "react";
import RelationCharts from "./graphs/dataService"; // Ruta hacia el archivo dataService.js
import UserContext from "./context/usercontext";
import NivelSeguridad from "./context/segEntryContext";

import "./graphics.css";

const GraphicsContext = () => {
  return (
    <div className="graphics-container">
      <div className="left-panel">
        <p>Más cositas próximamente</p>
      </div>
      <div className="nivel-seguridad">
        <NivelSeguridad />
      </div>
      <div className="user-context">
        <UserContext />
      </div>
      <div className="relation-charts">
        <RelationCharts />
      </div>
    </div>
  );
};

export default GraphicsContext;
