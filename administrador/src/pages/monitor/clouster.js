import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { db } from "../../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "./Clouster.css";
import Container from "../../components/container";

const Clouster = () => {
  const [emotionCounts, setEmotionCounts] = useState({});
  const [topEmotions, setTopEmotions] = useState([]);
  const [emotionSummary, setEmotionSummary] = useState("");
  const [predominantMessage, setPredominantMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    const fetchEmotionData = async () => {
      const emotionsData = {};
      const snapshot = await getDocs(collection(db, "entradas"));

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.emociones && Array.isArray(data.emociones)) {
          data.emociones.forEach((emotion) => {
            emotionsData[emotion] = (emotionsData[emotion] || 0) + 1;
          });
        }
      });

      setEmotionCounts(emotionsData);
      calculateTopEmotions(emotionsData);
      calculateEmotionSummary(emotionsData);
    };

    fetchEmotionData();
  }, []);

  const calculateTopEmotions = (data) => {
    const sortedEmotions = Object.entries(data).sort((a, b) => b[1] - a[1]);
    setTopEmotions(sortedEmotions.slice(0, 3));
  };

  const calculateEmotionSummary = (data) => {
    let total = 0;
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const emotionCategories = {
      alegría: "positiva",
      tristeza: "negativa",
      motivación: "positiva",
      pensamiento: "neutra",
    };

    for (const [emotion, count] of Object.entries(data)) {
      total += count;
      const category = emotionCategories[emotion.toLowerCase()];
      if (category === "positiva") positive += count;
      else if (category === "negativa") negative += count;
      else neutral += count;
    }

    const positivePercent = ((positive / total) * 100).toFixed(1);
    const negativePercent = ((negative / total) * 100).toFixed(1);
    const neutralPercent = ((neutral / total) * 100).toFixed(1);

    setEmotionSummary(
      `De las ${total} emociones, el ${positivePercent}% son positivas, el ${negativePercent}% son negativas y el ${neutralPercent}% son neutras.`
    );

    determinePredominantEmotionMessage(
      positivePercent,
      negativePercent,
      neutralPercent
    );
  };

  const determinePredominantEmotionMessage = (
    positivePercent,
    negativePercent,
    neutralPercent
  ) => {
    let message;
    if (positivePercent > negativePercent && positivePercent > neutralPercent) {
      message =
        "El estado de ánimo general es positivo, con la mayoría de los usuarios sintiéndose felices y motivados.";
    } else if (
      negativePercent > positivePercent &&
      negativePercent > neutralPercent
    ) {
      message =
        "El estado de ánimo general muestra un alto nivel de tristeza o miedo.";
    } else if (
      neutralPercent > positivePercent &&
      neutralPercent > negativePercent
    ) {
      message =
        "El estado de ánimo general es neutro, con usuarios en un estado de calma o reflexión.";
    } else {
      message = "El estado de ánimo es variado, con una mezcla de emociones.";
    }
    setPredominantMessage(message);
    setCustomMessage(message);
  };

  const handleSendNotification = async () => {
    try {
      await addDoc(collection(db, "notifications"), {
        nombreDeNotificacion: "Análisis de Emociones",
        descripcion: customMessage,
        tipoDeNotificacion: "Estado de ánimo",
        userId: "global",
        enviadoPor: "Sistema de Análisis de Emociones",
      });
      alert("Notificación global enviada con éxito.");
    } catch (error) {
      console.error("Error al enviar la notificación: ", error);
      alert("Error al enviar la notificación.");
    }
  };

  const chartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: "Emociones utilizadas",
        data: Object.values(emotionCounts),
        backgroundColor: ["#FFD700", "#FF6347", "#3CB371", "#4682B4"],
        borderColor: "#1e1e2f",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container>
      <div className="clouster-container">
        <h1>Análisis de Emociones</h1>
        <div className="chart-container uiverse-chart">
          <Bar
            data={chartData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
        <h2>Top de Emociones</h2>
        <ul className="top-emotions">
          {topEmotions.map(([emotion, count], index) => (
            <li key={index}>
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}: {count}{" "}
              veces
            </li>
          ))}
        </ul>
        <h2>Resumen de Emociones</h2>
        <p className="summary-text">{emotionSummary}</p>
        <h2>Mensaje Predominante</h2>
        <p
          className="predominant-message"
          onClick={() => setCustomMessage(predominantMessage)}
        >
          {predominantMessage}
        </p>
        <textarea
          className="uiverse-input"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          rows="4"
          placeholder="Modifica el mensaje antes de enviar..."
        ></textarea>
        <button onClick={handleSendNotification} className="uiverse-button">
          Enviar Notificación
        </button>
      </div>
    </Container>
  );
};

export default Clouster;
