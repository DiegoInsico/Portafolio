// pages/system/Inbox.js
import React from 'react';
import './notifications.css'; // Asegúrate de tener este CSS en la misma carpeta

// Datos simulados de notificaciones
const mockNotifications = [
  {
    id: '1',
    title: 'Nueva actividad registrada',
    message: 'Tu actividad de hoy fue registrada con éxito.',
    timestamp: '2024-10-01 10:30 AM',
    imageUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '2',
    title: 'Revisión pendiente',
    message: 'Tienes una revisión pendiente en tu proyecto.',
    timestamp: '2024-10-02 1:00 PM',
    imageUrl: 'https://via.placeholder.com/50',
  },
  {
    id: '3',
    title: 'Mensaje del sistema',
    message: 'Se ha actualizado la política de privacidad.',
    timestamp: '2024-10-03 8:45 AM',
    imageUrl: 'https://via.placeholder.com/50',
  },
];

const Inbox = () => {
  return (
    <div className="notifications-container">
      <h2 className="notifications-container__header">Bandeja de Entrada</h2>
      <div className="notifications-list">
        {mockNotifications.map((item) => (
          <div key={item.id} className="notifications-container__item">
            <img src={item.imageUrl} alt="Notificación" className="notifications-container__image" />
            <div className="notifications-container__text">
              <h3 className="notifications-container__title">{item.title}</h3>
              <p className="notifications-container__message">{item.message}</p>
              <p className="notifications-container__timestamp">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
