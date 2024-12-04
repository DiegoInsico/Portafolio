import React, { useState, useEffect } from "react";
import "./alertas.css";
import AnalisisChart from "./monitor/context/analisis";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
const Alertas = ({ adminDisplayName }) => {
  const [formData, setFormData] = useState({
    motivo: "",
    descripcion: "",
    horaEntrega: "",
    programarEnvio: false,
    destinatario: "Todos los Usuarios",
  });
  const [estadoAnimo, setEstadoAnimo] = useState("");

  // Obtener el estado de ánimo global desde Firestore o análisis
  useEffect(() => {
    async function fetchEstadoAnimo() {
      const entradasCollection = collection(db, "entradas");
      const snapshot = await getDocs(entradasCollection);
      const emocionesTotales = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        (data.emociones || []).forEach((emotion) => {
          if (!emocionesTotales[emotion]) emocionesTotales[emotion] = 0;
          emocionesTotales[emotion] += 1;
        });
      });

      const emocionDestacada = Object.entries(emocionesTotales).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || "Sin datos";
      setEstadoAnimo(emocionDestacada);
    }

    fetchEstadoAnimo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fechaEnvio = formData.programarEnvio
        ? new Date(formData.horaEntrega)
        : new Date();

      const destinatarios =
        formData.destinatario === "Todos los Usuarios" ? "Global" : formData.destinatario;

      const docRef = await addDoc(collection(db, "notificaciones"), {
        id: "",
        motivo: formData.motivo,
        descripcion: formData.descripcion,
        fechaEnvio: fechaEnvio,
        destinatario: destinatarios,
        enviadoPor: adminDisplayName,
      });

      console.log("Documento agregado con ID:", docRef.id);

      // Actualizar el campo ID del documento
      await docRef.update({ id: docRef.id });
      alert("Alerta creada exitosamente.");
    } catch (error) {
      console.error("Error al crear la notificación:", error);
      alert("Hubo un error al crear la alerta.");
    }
  };

  return (
    <div className="alerta-wrapper">
      <div className="alerta-form-container">
        <h2>Crear Alerta</h2>
        <p><strong>Estado de Ánimo Actual:</strong> {estadoAnimo}</p>
        <form className="alerta-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="motivo">Motivo de Alerta</label>
            <input
              type="text"
              id="motivo"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              required
              placeholder="Escribe el motivo"
            />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              placeholder="Escribe una descripción"
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="horaEntrega">Fecha/Hora de Envío</label>
            <input
              type="datetime-local"
              id="horaEntrega"
              name="horaEntrega"
              value={formData.horaEntrega}
              onChange={handleChange}
              disabled={!formData.programarEnvio}
            />
            <div className="form-group-inline">
              <label>
                <input
                  type="checkbox"
                  name="programarEnvio"
                  checked={formData.programarEnvio}
                  onChange={handleChange}
                />
                Programar envío
              </label>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="destinatario">Destinatario</label>
            <select
              id="destinatario"
              name="destinatario"
              value={formData.destinatario}
              onChange={handleChange}
            >
              <option value="Todos los Usuarios">Todos los Usuarios</option>
              {/* Puedes agregar más opciones según sea necesario */}
            </select>
          </div>
          <button type="submit" className="alerta-submit-button">
            Crear Alerta
          </button>
        </form>
      </div>
      <div className="alerta-graph-container">
        <AnalisisChart />
      </div>
    </div>
  );
};

export default Alertas;
