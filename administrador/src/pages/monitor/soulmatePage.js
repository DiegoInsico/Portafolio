import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import './styles.css';

const emotionToEmoji = (emotion) => {
    switch (emotion.toLowerCase()) {
        case 'alegría':
            return '😊';
        case 'tristeza':
            return '😢';
        case 'amor':
            return '❤️';
        case 'nostalgia':
            return '😌';
        case 'gratitud':
            return '🙏';
        case 'enfado':
            return '😡';
        case 'sorpresa':
            return '😲';
        case 'miedo':
            return '😨';
        case 'orgullo':
            return '😏';
        case 'vergüenza':
            return '😳';
        case 'ansiedad':
            return '😰';
        case 'esperanza':
            return '🌈';
        case 'confusión':
            return '😕';
        case 'inspiración':
            return '💡';
        case 'determinación':
            return '💪';
        case 'calma':
            return '😌';
        case 'euforia':
            return '🤩';
        case 'melancolía':
            return '😔';
        case 'arrepentimiento':
            return '😞';
        case 'frustración':
            return '😤';
        case 'diversión':
            return '😄';
        case 'satisfacción':
            return '😌';
        case 'culpa':
            return '😓';
        case 'alivio':
            return '😅';
        case 'curiosidad':
            return '🤔';
        case 'solidaridad':
            return '🤝';
        case 'fascinación':
            return '😍';
        case 'empatía':
            return '🤗';
        case 'cansancio':
            return '😩';
        case 'paz':
            return '🕊️';
        case 'resignación':
            return '😞';
        case 'admiración':
            return '👏';
        case 'ansia':
            return '🥺';
        case 'compasión':
            return '💞';
        case 'motivación':
            return '🔥';
        case 'soledad':
            return '😔';
        case 'ternura':
            return '🥰';
        default:
            return '🙂'; // Emoji por defecto si no se reconoce la emoción
    }
};

const SoulmatePage = () => {
  const [userEmotions, setUserEmotions] = useState([]);
  const [soulmates, setSoulmates] = useState([]);

  useEffect(() => {
    const fetchEmotions = async () => {
      try {
        const emotionsMap = {};
        const snapshot = await getDocs(collection(db, "entradas"));
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const { userId, emociones } = data;

          if (!emociones || emociones.length === 0) return;

          if (!emotionsMap[userId]) {
            emotionsMap[userId] = new Set();
          }

          emociones.forEach(emotion => {
            emotionsMap[userId].add(emotion);
          });
        });

        const emotionData = [];
        for (const userId in emotionsMap) {
          emotionData.push({
            userId,
            emotions: Array.from(emotionsMap[userId]),
          });
        }

        setUserEmotions(emotionData);
        findSoulmates(emotionData);
      } catch (error) {
        console.error("Error fetching emotions:", error);
      }
    };

    fetchEmotions();
  }, []);

  const findSoulmates = (emotionData) => {
    const matches = [];

    emotionData.forEach((user1, index) => {
      for (let j = index + 1; j < emotionData.length; j++) {
        const user2 = emotionData[j];
        const commonEmotions = user1.emotions.filter(emotion =>
          user2.emotions.includes(emotion)
        );

        if (commonEmotions.length > 0) {
          matches.push({
            user1: user1.userId,
            user2: user2.userId,
            commonEmotions,
          });
        }
      }
    });

    setSoulmates(matches);
  };

  return (
    <div className="soulmate-container">
      <h1>Similitudes de Emociones entre Usuarios</h1>
      
      {soulmates.length > 0 ? (
        <div className="soulmate-list">
          {soulmates.map((match, index) => (
            <div key={index} className="soulmate-item">
              <p><strong>Usuario {match.user1}</strong> y <strong>Usuario {match.user2}</strong> comparten estas emociones:</p>
              <div className="emotions">
                {match.commonEmotions.map((emotion, i) => (
                  <span key={i} className="emotion-item">
                    {emotionToEmoji(emotion)} {emotion}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay similitudes de emociones entre usuarios en este momento.</p>
      )}
    </div>
  );
};

export default SoulmatePage;
