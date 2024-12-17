import React from 'react';
import './Home.css';  // Asegúrate de importar el archivo CSS

const Home = () => {
  return (
    <div className="home-container">
      {/* Sección de bienvenida */}
      <section className="home-section">
        <div className="overlay"></div> {/* Overlay oscuro */}
        <div className="content">
          <h1 className="title">Bienvenido a Soy</h1>
          <p className="subtitle">Tu lugar seguro para conectar, aprender y crecer.</p>
        </div>
      </section>

      {/* Sección Footer */}
      <footer className="footer">
        <p>© 2024 Soy. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Home;
