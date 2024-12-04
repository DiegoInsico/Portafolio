import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según tu estructura
import "chart.js/auto";

const MensajesProgramadosChart = () => {
  const [userMessagesChartData, setUserMessagesChartData] = useState(null);
  const [mediaTypeChartData, setMediaTypeChartData] = useState(null);
  const [sentMessagesChartData, setSentMessagesChartData] = useState(null);
  const [dateTrendChartData, setDateTrendChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const mensajesCollection = collection(db, "mensajesProgramados");
      const snapshot = await getDocs(mensajesCollection);

      const userMessageCounts = {};
      const mediaTypes = {};
      let sentCount = 0;
      let unsentCount = 0;
      const dateTrends = {};

      let userCounter = 0;
      const userMapping = {}; // Mapear userId a nombres genéricos (user1, user2, etc.)

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Procesar mensajes por usuario
        const userId = data.userId || "Sin Usuario";
        if (!userMapping[userId]) {
          userCounter += 1;
          userMapping[userId] = `user${userCounter}`;
        }

        const userGenericName = userMapping[userId];
        if (!userMessageCounts[userGenericName]) userMessageCounts[userGenericName] = 0;
        userMessageCounts[userGenericName] += 1;

        // Procesar tipo de media
        const mediaType = data.mediaType || "Sin Tipo de Media";
        if (!mediaTypes[mediaType]) mediaTypes[mediaType] = 0;
        mediaTypes[mediaType] += 1;

        // Contar enviados vs no enviados
        if (data.enviado) sentCount += 1;
        else unsentCount += 1;

        // Procesar tendencias por fecha
        const fecha = data.fechaEnvio
          ? new Date(data.fechaEnvio.seconds * 1000).toLocaleDateString()
          : "Sin Fecha";
        if (!dateTrends[fecha]) dateTrends[fecha] = 0;
        dateTrends[fecha] += 1;
      });

      // Configuración de datos para los gráficos
      setUserMessagesChartData({
        labels: Object.keys(userMessageCounts),
        datasets: [
          {
            label: "Mensajes Programados por Usuario",
            data: Object.values(userMessageCounts),
            backgroundColor: "#2196F3",
            borderColor: "#1976D2",
            borderWidth: 1,
          },
        ],
      });

      setMediaTypeChartData({
        labels: Object.keys(mediaTypes),
        datasets: [
          {
            label: "Mensajes por Tipo de Media",
            data: Object.values(mediaTypes),
            backgroundColor: "#9C27B0",
            borderColor: "#7B1FA2",
            borderWidth: 1,
          },
        ],
      });

      setSentMessagesChartData({
        labels: ["Enviados", "No Enviados"],
        datasets: [
          {
            label: "Mensajes Enviados vs No Enviados",
            data: [sentCount, unsentCount],
            backgroundColor: ["#4CAF50", "#F44336"],
            borderColor: ["#388E3C", "#D32F2F"],
            borderWidth: 1,
          },
        ],
      });

      setDateTrendChartData({
        labels: Object.keys(dateTrends),
        datasets: [
          {
            label: "Tendencia de Envío de Mensajes",
            data: Object.values(dateTrends),
            backgroundColor: "#FFC107",
            borderColor: "#FFA000",
            borderWidth: 2,
            fill: false,
          },
        ],
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Mensajes Programados por Usuario</h2>
      {userMessagesChartData && <Bar data={userMessagesChartData} options={{ responsive: true }} />}

      <h2>Mensajes por Tipo de Media</h2>
      {mediaTypeChartData && <Bar data={mediaTypeChartData} options={{ responsive: true }} />}

      <h2>Mensajes Enviados vs No Enviados</h2>
      {sentMessagesChartData && <Pie data={sentMessagesChartData} options={{ responsive: true }} />}

      <h2>Tendencia de Envío de Mensajes</h2>
      {dateTrendChartData && <Line data={dateTrendChartData} options={{ responsive: true }} />}
    </div>
  );
};

export default MensajesProgramadosChart;
