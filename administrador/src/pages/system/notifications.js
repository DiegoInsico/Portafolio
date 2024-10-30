import { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import CustomAlert from "../../components/customAlert";
import "./notifications.css";

const Notifications = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [activityName, setActivityName] = useState("");
  const [notificationType, setNotificationType] = useState("Recordatorio");
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationsHistory, setNotificationsHistory] = useState([]);
  const [displayName, setAdminDisplayName] = useState("");
  const [editingNotification, setEditingNotification] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchUsers();
    fetchNotificationsHistory();
    checkAdminRole();
  }, []);

  const fetchUsers = async () => {
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setUsers(usersList);
  };

  const fetchNotificationsHistory = async () => {
    const notificationsCollection = collection(db, "notifications");
    const notificationsSnapshot = await getDocs(notificationsCollection);
    const notificationsList = notificationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setNotificationsHistory(notificationsList);
  };

  const checkAdminRole = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().role === "admin") {
        setIsAdmin(true);
        setAdminDisplayName(userDoc.data().displayName || "Administrador");
      }
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
  };

  const sendNotification = async () => {
    if ((selectedUser || selectedUser === "global") && message && isAdmin) {
      try {
        const notificationData = {
          nombreDeNotificacion: activityName,
          descripcion: message,
          tipoDeNotificacion: notificationType,
          userId: selectedUser === "global" ? "global" : selectedUser,
          enviadoPor: displayName,
        };

        await addDoc(collection(db, "notifications"), notificationData);
        showAlert("Notificación enviada con éxito");
        fetchNotificationsHistory();
      } catch (error) {
        console.error("Error al enviar notificación: ", error);
        showAlert("Hubo un error al enviar la notificación");
      }
    } else {
      showAlert("Por favor completa todos los campos o verifica tus permisos");
    }
  };

  const startEditingNotification = (notification) => {
    setEditingNotification(notification);
    setActivityName(notification.nombreDeNotificacion);
    setMessage(notification.descripcion);
    setNotificationType(notification.tipoDeNotificacion);
    setSelectedUser(notification.userId);
    setShowCreateForm(true);
  };

  const discardChanges = () => {
    setEditingNotification(null);
    setActivityName("");
    setMessage("");
    setNotificationType("Recordatorio");
    setSelectedUser("");
  };

  const saveEditedNotification = async () => {
    if (editingNotification) {
      try {
        const notificationRef = doc(
          db,
          "notifications",
          editingNotification.id
        );
        await updateDoc(notificationRef, {
          nombreDeNotificacion: activityName,
          descripcion: message,
          tipoDeNotificacion: notificationType,
        });
        showAlert("Notificación actualizada con éxito");
        discardChanges();
        fetchNotificationsHistory();
      } catch (error) {
        console.error("Error al actualizar notificación: ", error);
        showAlert("Hubo un error al actualizar la notificación");
      }
    }
  };

  const deleteNotification = async (notificationId) => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas eliminar esta notificación? Esta acción no se puede deshacer."
    );
    if (confirmation) {
      try {
        const notificationRef = doc(db, "notifications", notificationId);
        await deleteDoc(notificationRef);
        showAlert("Notificación eliminada con éxito");
        fetchNotificationsHistory();
      } catch (error) {
        console.error("Error al eliminar notificación: ", error);
        showAlert("Hubo un error al eliminar la notificación");
      }
    }
  };

  return (
    <div className="notifications-container">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
      <h2>Administración de Notificaciones</h2>
      <div className="button-group">
        <button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? "Ver Historial" : "Crear Notificación"}
        </button>
      </div>
      {isAdmin && showCreateForm && (
        <>
          <div className="form-group">
            <label>Usuario</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Selecciona un usuario</option>
              <option value="global">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nombre de Notificación</label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Tipo de Notificación</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value)}
            >
              <option value="Recordatorio">Recordatorio</option>
              <option value="Novedades">Novedades</option>
              <option value="Alerta">Alerta</option>
            </select>
          </div>
          <div className="form-group">
            <label>Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          {editingNotification ? (
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={saveEditedNotification}>Guardar Cambios</button>
              <button onClick={discardChanges}>Descartar Cambios</button>
            </div>
          ) : (
            <button onClick={sendNotification}>Enviar Notificación</button>
          )}
        </>
      )}
      {!showCreateForm && (
        <div className="notifications-table-container">
          <h3>Historial de Notificaciones</h3>
          <table className="notifications-table">
            <thead>
              <tr>
                <th>Nombre Notificación</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Usuario ID</th>
                <th>Enviado por</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {notificationsHistory.map((notif) => {
                return (
                  <tr key={notif.id}>
                    <td>{notif.nombreDeNotificacion}</td>
                    <td>{notif.tipoDeNotificacion}</td>
                    <td>{notif.descripcion}</td>
                    <td>{notif.userId}</td>
                    <td>{notif.enviadoPor}</td>
                    <td className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => startEditingNotification(notif)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteNotification(notif.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Notifications;
