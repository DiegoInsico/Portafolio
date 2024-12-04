import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta la ruta según tu estructura
import './css/music.css'
const Music = () => {
  const [mostPlayedArtist, setMostPlayedArtist] = useState(null); // Artista más reproducido
  const [mostPlayedSong, setMostPlayedSong] = useState(null); // Canción más reproducida
  const [artistImage, setArtistImage] = useState(null); // Imagen del artista

  useEffect(() => {
    const fetchMostPlayedArtist = async () => {
      try {
        const cancionesSnapshot = await getDocs(collection(db, "entradas"));
        const artistCount = {};
        const songDetails = {};

        cancionesSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.cancion?.artist && data.cancion?.name) {
            const artist = data.cancion.artist;
            const song = data.cancion.name;

            artistCount[artist] = (artistCount[artist] || 0) + 1;
            songDetails[artist] = song; // Vincula canción al artista

            // Guarda la última imagen del artista si está disponible
            if (data.cancion.albumImage) {
              setArtistImage(data.cancion.albumImage);
            }
          }
        });

        const maxCount = Math.max(...Object.values(artistCount));
        const mostPlayed = Object.keys(artistCount).filter(
          (artist) => artistCount[artist] === maxCount
        );

        // Seleccionar el último artista en caso de empate
        const finalArtist = mostPlayed.pop();

        setMostPlayedArtist(finalArtist);
        setMostPlayedSong(songDetails[finalArtist]);
      } catch (error) {
        console.error("Error al obtener el artista más reproducido:", error);
      }
    };

    fetchMostPlayedArtist();
  }, []);

  return (
    <div className="music-section">
      {mostPlayedArtist ? (
        <div className="music-card">
          {artistImage && (
            <img
              src={artistImage}
              alt={mostPlayedArtist}
              className="music-image"
            />
          )}
          <div className="music-info">
            <p className="music-artist">
              <strong>Artista:</strong> {mostPlayedArtist}
            </p>
            <p className="music-song">
              <strong>Canción:</strong> {mostPlayedSong}
            </p>
          </div>
        </div>
      ) : (
        <p className="music-message">No hay datos de artistas disponibles.</p>
      )}
    </div>
  );
};

export default Music;
