import { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './notifications.css';

const Notifications = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [activityName, setActivityName] = useState('');
  const [category, setCategory] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    };

    const checkAdminRole = async () => {
      const user = auth.currentUser;
      if (user) {
        // Aquí asumes que hay un campo "role" en el usuario
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    fetchUsers();
    checkAdminRole();
  }, [db, auth]);

  const sendNotification = async () => {
    if (selectedUser && message && isAdmin) {
      try {
        await addDoc(collection(db, 'gestion'), {
          id: selectedUser,
          nombreDeActividad: activityName,
          categoria: category,
          userId: selectedUser,
          message
        });
        alert('Notificación enviada con éxito');
      } catch (error) {
        console.error("Error al enviar notificación: ", error);
        alert('Hubo un error al enviar la notificación');
      }
    } else {
      alert('Por favor completa todos los campos o verifica tus permisos');
    }
  };

  return (
    <div className="notifications-container">
      <h2>Administración de Notificaciones</h2>
      {isAdmin ? (
        <>
          <div className="form-group">
            <label>Usuario</label>
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">Selecciona un usuario</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nombre de Actividad</label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button onClick={sendNotification}>Enviar Notificación</button>
        </>
      ) : (
        <p>No tienes permisos de administrador para enviar notificaciones.</p>
      )}
    </div>
  );
};

export default Notifications;
