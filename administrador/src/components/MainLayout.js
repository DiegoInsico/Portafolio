// src/components/MainLayout.js
import React from "react";
import TopBar from "./TopBar"; // Barra superior

const MainLayout = ({ currentUser, children }) => {
  return (
    <div>
      <TopBar currentUser={currentUser} /> {/* Barra superior en todas las pantallas */}
      <main>{children}</main> {/* Contenido de la página actual */}
    </div>
  );
};

export default MainLayout;
