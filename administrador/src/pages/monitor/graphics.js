import React from "react";
import RelationCharts from "./graphs/dataService"; // Ruta hacia el archivo dataService.js
import UserContext from "./context/usercontext";
import NivelSeguridad from "./context/segEntryContext";

import "./graphics.css";
import ExportPage from "./export";
import ExportPagesi from "./export";

const GraphicsContext = () => {
    return (
      <div className="graphics-container">
        <div className="top-left">
          <ExportPagesi/>
        </div>
        <div className="top-right">
          <RelationCharts/>
        </div>
        <div className="bottom-left">
          <NivelSeguridad />
        </div>
        <div className="bottom-right">
          <UserContext />
        </div>
      </div>
    );
  };
  


export default GraphicsContext;
