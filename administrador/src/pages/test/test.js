// test.js
import React from 'react';
import './test.css';

const TestPage = () => {
  const messages = [
    { name: "Usuario 1", subject: "Asunto 1", message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", date: "2024-11-05", status: "Pendiente" },
    { name: "Usuario 2", subject: "Asunto 2", message: "Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.", date: "2024-11-04", status: "Completo" },
    { name: "Usuario 3", subject: "Asunto 3", message: "Pellentesque habitant morbi tristique senectus et netus et malesuada.", date: "2024-11-03", status: "Pendiente" },
    { name: "Usuario 4", subject: "Asunto 4", message: "Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales.", date: "2024-11-02", status: "Completo" },
    { name: "Usuario 5", subject: "Asunto 5", message: "Donec vehicula cursus vestibulum.", date: "2024-11-01", status: "Pendiente" },
    { name: "Usuario 6", subject: "Asunto 6", message: "Ut convallis, purus nec pharetra pulvinar, enim magna laoreet nisi.", date: "2024-11-06", status: "Pendiente" },
    { name: "Usuario 7", subject: "Asunto 7", message: "Proin ut ligula vel nunc egestas porttitor.", date: "2024-11-07", status: "Completo" },
    { name: "Usuario 8", subject: "Asunto 8", message: "Curabitur sodales ligula in libero.", date: "2024-11-08", status: "Pendiente" },
    { name: "Usuario 9", subject: "Asunto 9", message: "Sed dignissim lacinia nunc.", date: "2024-11-09", status: "Pendiente" },
  ];

  return (
    <div className="container">
      <div className="left-section">
        <div className="form-card1">
          <div className="form-card2">
            <form className="form">
              <p className="form-heading">Get In Touch</p>
              <div className="form-field">
                <input required placeholder="Name" className="input-field" type="text" />
              </div>
              <div className="form-field">
                <input required placeholder="Email" className="input-field" type="email" />
              </div>
              <div className="form-field">
                <input required placeholder="Subject" className="input-field" type="text" />
              </div>
              <div className="form-field">
                <textarea required placeholder="Message" cols={30} rows={3} className="input-field" defaultValue={""} />
              </div>
              <button className="sendMessage-btn">Send Message</button>
            </form>
          </div>
        </div>
      </div>
      <div className="right-section">
        <h2>Lista de Mensajes</h2>
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <h3>Nombre: {msg.name}</h3>
            <p><strong>Asunto:</strong> {msg.subject}</p>
            <p><strong>Mensaje:</strong> {msg.message}</p>
            <p><strong>Fecha:</strong> {msg.date}</p>
            <p><strong>Estado:</strong> {msg.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestPage;
