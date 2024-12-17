import React, { useState, useEffect } from 'react';
import MiniNav from './miniNav';
import CreateCollage from './createCollage';
import ListCollages from './listCollage';
import './CollagePage.css';
import { subscribeToCollages, deleteCollage } from '../../firebase';
import { useAuth } from '../../page/auth/authContext';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';

const CollagePage = () => {
  const { currentUser } = useAuth();
  const [isCreatingCollage, setIsCreatingCollage] = useState(false);
  const [collages, setCollages] = useState([]);
  const [showCollagesList, setShowCollagesList] = useState(true);
  const [error, setError] = useState(null);
  const [draftCollageId, setDraftCollageId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setCollages([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToCollages(
      currentUser.uid,
      (collagesData) => {
        console.log("Collages actualizados en tiempo real:", collagesData);
        setCollages(collagesData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al suscribirse a collages:', error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleSelectCollage = (collage) => {
    console.log("Collage seleccionado:", collage);
    navigate(`/collage/${collage.id}`);
  };

  const handleDeleteCollage = async (collageId) => {
    try {
      await deleteCollage(collageId);
    } catch (error) {
      console.error("Error eliminando el collage:", error);
      setError(error);
    }
  };

  const startCreatingCollage = async () => {
    if (!currentUser?.uid) {
      alert('Debes estar autenticado para crear un collage.');
      return;
    }

    try {
      const defaultTitleData = {
        position: { x: 50, y: 20 },
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        zIndex: 1
      };
      const draftRef = doc(db, 'collages', uuidv4());
      await setDoc(draftRef, {
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        entries: [],
        titleData: defaultTitleData
      });
      console.log("Borrador de collage creado con ID:", draftRef.id);
      setDraftCollageId(draftRef.id);
      setIsCreatingCollage(true);
      setShowCollagesList(false);
    } catch (error) {
      console.error('Error creando el borrador del collage', error);
      alert('Hubo un error al crear el collage. Por favor, inténtalo de nuevo.');
    }
  };

  const handleShowList = () => {
    setIsCreatingCollage(false);
    setShowCollagesList(true);
  };

  if (loading) {
    return <p>Cargando collages...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="scroll-container">
      <section className="timeline-section">
        <div className="page-one-collage">
          <div className="titulo-left">   
            <h1>Pensadero</h1>
          </div>
          <div className="titulo-right">
            <p>
              Este es el lugar donde puedes revivir y visitar todas tus recuedos conectando tu historia con el pasado.
            </p>
          </div>
        </div>
      </section>

      <section className="collage-section">
        <MiniNav
          className="mini-nav"
          onToggleCollagesList={handleShowList}
          onStartCreatingCollage={startCreatingCollage}
        />
        <div className="render-content">
          {isCreatingCollage ? (
            <CreateCollage
              setIsCreatingCollage={setIsCreatingCollage}
              collageId={draftCollageId}
            />
          ) : showCollagesList ? (
            <ListCollages
              collages={collages}
              onSelectCollage={handleSelectCollage}
              onDeleteCollage={handleDeleteCollage}
            />
          ) : (
            <div className="placeholder">
              <p>Selecciona una opción del menú para empezar.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CollagePage;
