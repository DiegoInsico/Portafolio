import React, { useEffect, useState } from "react";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2"; // Gráficos
import "./clouster.css";
import CustomAlert from "../../components/customAlert";

ChartJS.register(ArcElement, Tooltip, Legend);

const Clouster = () => {
  // Estados principales
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    renewalRate: 0,
    cancellationRate: 0,
  });
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [announcement, setAnnouncement] = useState({
    message: "",
    audience: "all",
    scheduledDate: new Date(),
  });
  const [chartData, setChartData] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  // Fetch inicial de datos
  useEffect(() => {
    fetchUserStats();
    fetchLogs();
    fetchAlerts();
  }, []);

  // 1. Obtener métricas de usuarios
  const fetchUserStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const totalUsers = usersSnapshot.size;
      let premiumUsers = 0;

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isPremium) premiumUsers++;
      });

      const freeUsers = totalUsers - premiumUsers;

      setUserStats({
        totalUsers,
        premiumUsers,
        freeUsers,
        renewalRate: calculateRenewalRate(premiumUsers), // Ejemplo de cálculo
        cancellationRate: calculateCancellationRate(premiumUsers), // Ejemplo de cálculo
      });

      setChartData({
        labels: ["Premium", "Gratuito"],
        datasets: [
          {
            label: "Distribución de Usuarios",
            data: [premiumUsers, freeUsers],
            backgroundColor: ["#bb86fc", "#03dac6"],
            borderColor: ["#bb86fc", "#03dac6"],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error("Error obteniendo estadísticas de usuarios:", error);
    }
  };

  // Cálculo de métricas (simulado)
  const calculateRenewalRate = (premiumUsers) =>
    (premiumUsers * 0.8).toFixed(2); // Ejemplo: 80%
  const calculateCancellationRate = (premiumUsers) =>
    (premiumUsers * 0.2).toFixed(2); // Ejemplo: 20%

  // 2. Obtener logs de auditoría
  const fetchLogs = async () => {
    try {
      const logsSnapshot = await getDocs(collection(db, "logs"));
      const ticketsSnapshot = await getDocs(collection(db, "tickets")); // Agregamos tickets
      const employeesSnapshot = await getDocs(collection(db, "employees")); // Agregamos empleados
      const logsData = [];
      const employeeMap = {};

      // Mapear empleados
      employeesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Empleado encontrado: ${data.displayName}, IDDocument: ${doc.id}`);
        employeeMap[doc.id] = {
          displayName: data.displayName || "Desconocido",
          role: data.role || "Sin rol",
          employeeId: data.employeeId, // Opcional, por si es necesario.
        };
      });
      

      console.log("Mapa de empleados procesado: ", employeeMap);

      // Procesar logs existentes
      logsSnapshot.forEach((doc) => logsData.push(doc.data()));

      // Procesar asignaciones y respuestas desde tickets
      ticketsSnapshot.forEach((doc) => {
        const ticketData = doc.data();
        console.log(`Ticket encontrado: ${doc.id}`, ticketData);
      
        const assignedEmployee = employeeMap[ticketData.assignedTo]; // Buscar en el mapa por idDocument.
      
        if (assignedEmployee) {
          console.log(`Empleado asignado encontrado: ${assignedEmployee.displayName}`);
          logsData.push({
            timestamp: ticketData.updatedAt || ticketData.createdAt,
            description: `Asignación de ticket: ${ticketData.subject}`,
            action: `Asignado a: ${assignedEmployee.displayName} - ${assignedEmployee.role}`,
          });
        } else {
          console.log(`Empleado asignado no encontrado: ${ticketData.assignedTo}`);
          logsData.push({
            timestamp: ticketData.updatedAt || ticketData.createdAt,
            description: `Asignación de ticket: ${ticketData.subject}`,
            action: `Asignado a: Desconocido`,
          });
        }
      
        // Procesar respuesta, si existe.
        if (ticketData.respuesta) {
          logsData.push({
            timestamp: ticketData.updatedAt || ticketData.createdAt,
            description: `Respuesta registrada para ticket: ${ticketData.subject}`,
            action: `Estado: ${ticketData.status || "Abierto"}, Respuesta: ${ticketData.respuesta}`,
            respondedBy: assignedEmployee
              ? `${assignedEmployee.displayName} - ${assignedEmployee.role}`
              : "Desconocido",
          });
        }
      });
      

      setLogs(logsData);
    } catch (error) {
      console.error("Error obteniendo logs:", error);
    }
  };

  // 3. Obtener alertas generadas automáticamente
  const fetchAlerts = async () => {
    try {
      const alertsSnapshot = await getDocs(collection(db, "alerts"));
      const alertsData = [];
      alertsSnapshot.forEach((doc) => alertsData.push(doc.data()));
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error obteniendo alertas:", error);
    }
  };

  // 4. Crear y programar anuncios
  const handleCreateAnnouncement = async (announcementData) => {
    try {
      // Guarda el anuncio en "announcements"
      const docRef = await addDoc(collection(db, "announcements"), {
        ...announcementData,
        createdAt: Timestamp.now(),
      });

      // Registra una alerta operativa en "alerts"
      await addDoc(collection(db, "alerts"), {
        title: "Nuevo Anuncio Creado",
        message: `Se ha creado un anuncio dirigido a ${announcementData.audience}.`,
        relatedDocId: docRef.id, // Relaciona con el anuncio creado
        timestamp: Timestamp.now(),
      });
      setAlertMessage("¡El anuncio ha sido creado exitosamente!");
    } catch (error) {
      console.error("Error al crear el anuncio y la alerta:", error);
    }
  };
  return (
    <div className="clouster-container">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          duration={5000}
        />
      )}
      {/* Gráfico de Distribución de Usuarios */}
      <div className="clouster-stats">
        <h2 className="clouster-title">Distribución de Usuarios</h2>
        {chartData ? (
          <div className="clouster-content">
            <div className="clouster-chart">
              <Pie data={chartData} />
            </div>
            <div className="clouster-summary">
              <p>Total de Usuarios: {userStats.totalUsers}</p>
              <p>Usuarios Premium: {userStats.premiumUsers}</p>
              <p>Usuarios Gratuitos: {userStats.freeUsers}</p>
              <p>Tasa de Renovación: {userStats.renewalRate}%</p>
              <p>Tasa de Cancelación: {userStats.cancellationRate}%</p>
            </div>
          </div>
        ) : (
          <p className="clouster-loading">Cargando datos...</p>
        )}
      </div>

      {/* Logs de Auditoría */}
      <div className="clouster-logs">
        <h2 className="clouster-title">Logs de Auditoría</h2>
        <div className="clouster-logs-table">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestamp?.toDate().toLocaleString() || "N/A"}</td>
                    <td>{log.description || "Sin descripción"}</td>
                    <td>{log.action || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No hay registros disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas Operativas */}
      <div className="clouster-alerts">
        <h2 className="clouster-title">Alertas Operativas</h2>
        <div className="clouster-alerts-list">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <div key={index} className="clouster-alert">
                <p>
                  <strong>{alert.title || "Alerta"}</strong>
                </p>
                <p>{alert.message || "Mensaje no disponible."}</p>
                {alert.relatedDocId && (
                  <p>
                    <strong>Documento Relacionado:</strong> {alert.relatedDocId}
                  </p>
                )}
                <p className="alert-timestamp">
                  {alert.timestamp?.toDate().toLocaleString() || "N/A"}
                </p>
              </div>
            ))
          ) : (
            <p>No hay alertas disponibles.</p>
          )}
        </div>
      </div>

      {/* Formulario para Crear Anuncios */}
      <div className="clouster-announcement">
        <h2 className="clouster-title">Crear Anuncio</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const announcementData = {
              message: e.target["announcement-message"].value,
              audience: e.target["announcement-audience"].value,
              scheduledDate: new Date(e.target["announcement-date"].value),
            };
            handleCreateAnnouncement(announcementData);
          }}
        >
          <div className="form-group">
            <label htmlFor="announcement-message">Mensaje:</label>
            <textarea
              id="announcement-message"
              value={announcement.message}
              onChange={(e) =>
                setAnnouncement({ ...announcement, message: e.target.value })
              }
              maxLength="280"
              placeholder="Escribe un mensaje para los usuarios (máximo 280 caracteres)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="announcement-audience">Audiencia:</label>
            <select
              id="announcement-audience"
              value={announcement.audience}
              onChange={(e) =>
                setAnnouncement({ ...announcement, audience: e.target.value })
              }
            >
              <option value="all">Todos los usuarios</option>
              <option value="premium">Usuarios Premium</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="announcement-date">Fecha de Envío:</label>
            <input
              type="datetime-local"
              id="announcement-date"
              value={announcement.scheduledDate.toISOString().substring(0, 16)}
              onChange={(e) =>
                setAnnouncement({
                  ...announcement,
                  scheduledDate: new Date(e.target.value),
                })
              }
            />
          </div>
          <button type="submit" className="clouster-submit-button">
            Crear Anuncio
          </button>
        </form>
      </div>
    </div>
  );
};

export default Clouster;
