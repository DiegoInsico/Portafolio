import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta esta ruta según tu estructura
import "chart.js/auto";

const EntradasChart = () => {
  const [baulChartData, setBaulChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [emotionChartData, setEmotionChartData] = useState(null);
  const [dateTrendChartData, setDateTrendChartData] = useState(null);
  const [levelChartData, setLevelChartData] = useState(null);
  const [protectedChartData, setProtectedChartData] = useState(null);
  const [mediaTypeChartData, setMediaTypeChartData] = useState(null);
  const [mediaChartData, setMediaChartData] = useState(null);
  const [songChartData, setSongChartData] = useState(null);
  const [audioChartData, setAudioChartData] = useState(null);
  const [colorChartData, setColorChartData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const entradasCollection = collection(db, "entradas");
      const snapshot = await getDocs(entradasCollection);

      let baulTrue = 0;
      let baulFalse = 0;
      const nicknames = {};
      const categories = {};
      const emotions = {};
      const dateTrends = {};
      const levels = {};
      let protectedTrue = 0;
      let protectedFalse = 0;
      const mediaTypes = {};
      let mediaCount = 0;
      let noMediaCount = 0;
      let songCount = 0;
      let noSongCount = 0;
      let audioCount = 0;
      let noAudioCount = 0;
      const colors = {};

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Procesar baúl
        if (data.baul) baulTrue += 1;
        else baulFalse += 1;

        // Procesar nickname
        const nickname = data.nickname || "Sin Nickname";
        if (!nicknames[nickname]) nicknames[nickname] = 0;
        nicknames[nickname] += 1;

        // Procesar categoría
        const category = data.categoria || "Sin Categoría";
        if (!categories[category]) categories[category] = 0;
        categories[category] += 1;

        // Procesar emociones
        (data.emociones || []).forEach((emotion) => {
          if (!emotions[emotion]) emotions[emotion] = 0;
          emotions[emotion] += 1;
        });

        // Procesar niveles
        const level = data.nivel || "Sin Nivel";
        if (!levels[level]) levels[level] = 0;
        levels[level] += 1;

        // Procesar protección
        if (data.isProtected) protectedTrue += 1;
        else protectedFalse += 1;

        // Procesar tipo de media
        const mediaType = data.mediaType || "Sin Media";
        if (!mediaTypes[mediaType]) mediaTypes[mediaType] = 0;
        mediaTypes[mediaType] += 1;

        // Procesar media
        if (data.media) mediaCount += 1;
        else noMediaCount += 1;

        // Procesar canciones
        if (data.cancion) songCount += 1;
        else noSongCount += 1;

        // Procesar colores
        const color = data.color || "Sin Color";
        if (!colors[color]) colors[color] = 0;
        colors[color] += 1;

        // Procesar audios
        if (data.audio) audioCount += 1;
        else noAudioCount += 1;

        // Procesar tendencias por fecha
        const fecha = data.fechaCreacion
          ? new Date(data.fechaCreacion.seconds * 1000).toLocaleDateString()
          : "Sin Fecha";
        if (!dateTrends[fecha]) dateTrends[fecha] = 0;
        dateTrends[fecha] += 1;
      });

      // Configuración de datos para los gráficos
      setBaulChartData({
        labels: ["Con Baúl", "Sin Baúl"],
        datasets: [
          {
            label: "Entradas con/sin Baúl",
            data: [baulTrue, baulFalse],
            backgroundColor: ["#4CAF50", "#FFC107"],
            borderColor: ["#388E3C", "#FFA000"],
            borderWidth: 1,
          },
        ],
      });
      
      setCategoryChartData({
        labels: Object.keys(categories),
        datasets: [
          {
            label: "Entradas por Categoría",
            data: Object.values(categories),
            backgroundColor: "#9C27B0",
            borderColor: "#7B1FA2",
            borderWidth: 1,
          },
        ],
      });

      setEmotionChartData({
        labels: Object.keys(emotions),
        datasets: [
          {
            label: "Entradas por Emoción",
            data: Object.values(emotions),
            backgroundColor: "#FF5722",
            borderColor: "#E64A19",
            borderWidth: 1,
          },
        ],
      });

      setDateTrendChartData({
        labels: Object.keys(dateTrends),
        datasets: [
          {
            label: "Tendencia de Creación de Entradas",
            data: Object.values(dateTrends),
            backgroundColor: "#03A9F4",
            borderColor: "#0288D1",
            borderWidth: 2,
            fill: false,
          },
        ],
      });

      // Configuración de datos para los gráficos
      setLevelChartData({
        labels: Object.keys(levels),
        datasets: [
          {
            label: "Entradas por Nivel",
            data: Object.values(levels),
            backgroundColor: "#FFC107",
            borderColor: "#FFA000",
            borderWidth: 1,
          },
        ],
      });

      setProtectedChartData({
        labels: ["Protegidas", "No Protegidas"],
        datasets: [
          {
            label: "Entradas Protegidas vs No Protegidas",
            data: [protectedTrue, protectedFalse],
            backgroundColor: ["#4CAF50", "#F44336"],
            borderColor: ["#388E3C", "#D32F2F"],
            borderWidth: 1,
          },
        ],
      });

      setMediaTypeChartData({
        labels: Object.keys(mediaTypes),
        datasets: [
          {
            label: "Entradas por Tipo de Media",
            data: Object.values(mediaTypes),
            backgroundColor: "#03A9F4",
            borderColor: "#0288D1",
            borderWidth: 1,
          },
        ],
      });

      setMediaChartData({
        labels: ["Con Media", "Sin Media"],
        datasets: [
          {
            label: "Entradas con/sin Media",
            data: [mediaCount, noMediaCount],
            backgroundColor: ["#9C27B0", "#E91E63"],
            borderColor: ["#7B1FA2", "#C2185B"],
            borderWidth: 1,
          },
        ],
      });

      setSongChartData({
        labels: ["Con Canción", "Sin Canción"],
        datasets: [
          {
            label: "Entradas con/sin Canciones",
            data: [songCount, noSongCount],
            backgroundColor: ["#FF5722", "#795548"],
            borderColor: ["#E64A19", "#6D4C41"],
            borderWidth: 1,
          },
        ],
      });

      setAudioChartData({
        labels: ["Con Audio", "Sin Audio"],
        datasets: [
          {
            label: "Entradas con/sin Audio",
            data: [audioCount, noAudioCount],
            backgroundColor: ["#8BC34A", "#CDDC39"],
            borderColor: ["#7CB342", "#C0CA33"],
            borderWidth: 1,
          },
        ],
      });

      setDateTrendChartData({
        labels: Object.keys(dateTrends),
        datasets: [
          {
            label: "Tendencia de Creación de Entradas",
            data: Object.values(dateTrends),
            backgroundColor: "#FF9800",
            borderColor: "#F57C00",
            borderWidth: 2,
            fill: false,
          },
        ],
      });

      setColorChartData({
        labels: Object.keys(colors),
        datasets: [
          {
            label: "Distribución de Colores",
            data: Object.values(colors),
            backgroundColor: Object.keys(colors).map(
              () =>
                `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                  Math.random() * 255
                }, 0.5)`
            ),
            borderColor: Object.keys(colors).map(
              () =>
                `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
                  Math.random() * 255
                }, 1)`
            ),
            borderWidth: 1,
          },
        ],
      });
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Entradas con/sin Baúl</h2>
      {baulChartData && (
        <Pie data={baulChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas por Categoría</h2>
      {categoryChartData && (
        <Bar data={categoryChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas por Emoción</h2>
      {emotionChartData && (
        <Bar data={emotionChartData} options={{ responsive: true }} />
      )}

      <h2>Tendencia de Creación de Entradas</h2>
      {dateTrendChartData && (
        <Line data={dateTrendChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas por Nivel</h2>
      {levelChartData && (
        <Bar data={levelChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas Protegidas vs No Protegidas</h2>
      {protectedChartData && (
        <Pie data={protectedChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas por Tipo de Media</h2>
      {mediaTypeChartData && (
        <Bar data={mediaTypeChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas con/sin Media</h2>
      {mediaChartData && (
        <Pie data={mediaChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas con/sin Canciones</h2>
      {songChartData && (
        <Pie data={songChartData} options={{ responsive: true }} />
      )}

      <h2>Entradas con/sin Audio</h2>
      {audioChartData && (
        <Pie data={audioChartData} options={{ responsive: true }} />
      )}

      <h2>Distribución de Colores</h2>
      {colorChartData && (
        <Bar data={colorChartData} options={{ responsive: true }} />
      )}
    </div>
  );
};

export default EntradasChart;
