import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import '../system/notifications.css';
import { db } from '../../firebase';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [response, setResponse] = useState({});
  const [editMode, setEditMode] = useState({});

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'solicitudes');
        const notificationsSnapshot = await getDocs(notificationsRef);

        const notificationsList = await Promise.all(
          notificationsSnapshot.docs.map(async (notificationDoc) => {
            const notificationData = notificationDoc.data();
            const userId = notificationData.userId;

            let displayName = "Usuario desconocido";
            if (userId) {
              const userRef = doc(db, 'users', userId);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                displayName = userDoc.data().displayName || "Usuario desconocido";
              }
            }

            return { id: notificationDoc.id, ...notificationData, displayName };
          })
        );

        setNotifications(notificationsList);
      } catch (error) {
        console.error("Error al obtener las solicitudes:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleSendResponse = async (messageId) => {
    if (!response[messageId] || response[messageId].trim() === '') {
      alert('Por favor, escribe una respuesta antes de enviar.');
      return;
    }

    try {
      const messageRef = doc(db, 'solicitudes', messageId);
      await updateDoc(messageRef, { respuesta: response[messageId], estado: "respondido" });
      alert('Respuesta enviada con éxito');

      setNotifications((prevNotifications) =>
        prevNotifications.map((item) =>
          item.id === messageId ? { ...item, respuesta: response[messageId], estado: "respondido" } : item
        )
      );
      setResponse((prevResponse) => ({ ...prevResponse, [messageId]: '' }));
    } catch (error) {
      console.error("Error al enviar la respuesta:", error);
    }
  };

  const handleEditResponse = (messageId) => {
    setEditMode((prevEditMode) => ({ ...prevEditMode, [messageId]: !prevEditMode[messageId] }));
    setResponse((prevResponse) => ({ ...prevResponse, [messageId]: '' }));
  };

  const handleResponseChange = (messageId, value) => {
    setResponse((prevResponse) => ({ ...prevResponse, [messageId]: value }));
  };

  return (
    <div className="notifications-container">
      <h2 className="notifications-container__header">Bandeja de Entrada</h2>
      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div key={item.id} className="notifications-container__item">
              <div className="notifications-user">
                <img src="https://via.placeholder.com/50" alt="Usuario" className="notifications-user__image" />
                <p className="notifications-user__name">{item.displayName}</p>
                <h3 className="notifications-title">{item.motivo}</h3>
                <p className="notifications-message">{item.description}</p>
                <p className="notifications-date">{new Date(item.date.seconds * 1000).toLocaleString()}</p>
              </div>
              <div className="notifications-admin">
                <p className="notifications-response-status">
                  Estado de respuesta: {item.estado || "En espera"}
                </p>
                {item.estado === "respondido" && !editMode[item.id] ? (
                  <>
                    <p className="notifications-response">
                      Respuesta: {item.respuesta}
                    </p>
                    <button onClick={() => handleEditResponse(item.id)} className="action-button">
                      Editar Respuesta
                    </button>
                  </>
                ) : (
                  <>
                    <textarea
                      placeholder="Escribe tu respuesta..."
                      value={response[item.id] || ''}
                      onChange={(e) => handleResponseChange(item.id, e.target.value)}
                      className="notifications-response-textarea"
                    />
                    <button onClick={() => handleSendResponse(item.id)} className="action-button send-button">
                      {item.estado === "respondido" ? "Actualizar Respuesta" : "Enviar Respuesta"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No hay notificaciones para mostrar</p>
        )}
      </div>
    </div>
  );
};

export default Inbox;
