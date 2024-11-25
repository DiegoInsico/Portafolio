// src/components/LineaDeTiempo.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import Modal from "react-modal";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./LineaDeTiempo.css";

Modal.setAppElement("#root"); // Accesibilidad

const LineaDeTiempo = () => {
  const [entradas, setEntradas] = useState([]);
  const [categoria, setCategoria] = useState("todos");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchEntradas = async () => {
      try {
        const q = query(collection(db, "entradas"), orderBy("fecha"));
        const querySnapshot = await getDocs(q);
        const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEntradas(datos);
      } catch (error) {
        console.error("Error al obtener las entradas: ", error);
      }
    };

    fetchEntradas();
  }, []);

  const categorias = ["todos", "personal", "laboral", "familiar"]; // Añade tus categorías aquí

  const entradasFiltradas = categoria === "todos"
    ? entradas
    : entradas.filter(entrada => entrada.categoria === categoria);

  const abrirModal = (entrada) => {
    setEntradaSeleccionada(entrada);
    setModalIsOpen(true);
  };

  const cerrarModal = () => {
    setModalIsOpen(false);
    setEntradaSeleccionada(null);
  };

  return (
    <div className="linea-de-tiempo-container">
      {/* Filtro por categoría */}
      <div className="filtros">
        {categorias.map(cat => (
          <button
            key={cat}
            className={categoria === cat ? "activo" : ""}
            onClick={() => setCategoria(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={50}
        slidesPerView={1}
      >
        {entradasFiltradas.map(entrada => (
          <SwiperSlide key={entrada.id}>
            <div className="evento" onClick={() => abrirModal(entrada)}>
              <div className="evento-fecha">
                {new Date(entrada.fecha.seconds * 1000).toLocaleDateString()}
              </div>
              <div className="evento-contenido">
                <h3>{entrada.titulo}</h3>
                <p>{entrada.descripcion}</p>
                {entrada.imagen && <img src={entrada.imagen} alt={entrada.titulo} />}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Línea de tiempo visual */}
      <div className="linea-vertical">
        {entradasFiltradas.map((entrada, index) => (
          <div key={entrada.id} className="punto" style={{ top: `${index * 100}px` }}>
            <div className="circulo" onClick={() => abrirModal(entrada)}></div>
            <div className="linea"></div>
          </div>
        ))}
      </div>

      {/* Modal para detalles del evento */}
      {entradaSeleccionada && (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={cerrarModal}
          contentLabel="Detalles del Evento"
          className="modal"
          overlayClassName="overlay"
        >
          <button onClick={cerrarModal} className="cerrar-modal">&times;</button>
          <h2>{entradaSeleccionada.titulo}</h2>
          <p><strong>Fecha:</strong> {new Date(entradaSeleccionada.fecha.seconds * 1000).toLocaleDateString()}</p>
          <p>{entradaSeleccionada.descripcion}</p>
          {entradaSeleccionada.imagen && <img src={entradaSeleccionada.imagen} alt={entradaSeleccionada.titulo} />}
        </Modal>
      )}
    </div>
  );
};

export default LineaDeTiempo;
