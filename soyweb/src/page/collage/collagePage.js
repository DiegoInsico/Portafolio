// CollagePage.js

import React, { useState, useEffect } from 'react';
import MiniNav from './miniNav';
import CreateCollage from './createCollage';
import ListCollages from './listCollage'; // Asegúrate de que la ruta es correcta
import './CollagePage.css';
import { subscribeToCollages, deleteCollage, createCollageAlbum } from '../../firebase'; // Asegúrate de importar createCollageAlbum
import { useAuth } from '../../page/auth/authContext'; // Importa el hook useAuth
import { useNavigate } from 'react-router-dom';

const CollagePage = () => {
  const { currentUser } = useAuth(); // Obtiene currentUser desde el contexto
  const [isCreatingCollage, setIsCreatingCollage] = useState(false);
  const [collages, setCollages] = useState([]);
  const [showCollagesList, setShowCollagesList] = useState(true);
  const [selectedCollage, setSelectedCollage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setCollages([]);
      setLoading(false);
      return;
    }

    // Suscribirse a los cambios en tiempo real
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

    // Limpiar la suscripción cuando el componente se desmonte o el usuario cambie
    return () => unsubscribe();
  }, [currentUser]);

  const toggleCollagesList = () => {
    setShowCollagesList((prev) => !prev);
  };

  const handleSelectCollage = (collage) => {
    console.log("Collage seleccionado:", collage); // Log del collage seleccionado
    navigate(`/collage/${collage.id}`);
  };

  const handleDeleteCollage = async (collageId) => {
    try {
      await deleteCollage(collageId); // Llama a la función para eliminar en Storage y Firestore
      // No es necesario actualizar el estado manualmente si usas un escuchador en tiempo real
    } catch (error) {
      console.error("Error eliminando el collage:", error);
      setError(error);
    }
  };

  // Modificación para devolver el collageId después de crear
  const handleAddCollage = async (collageName, selectedEntries, thumbnail) => {
    try {
      const newCollageId = await createCollageAlbum(collageName, selectedEntries, thumbnail, currentUser);
      console.log('Collage creado con ID:', newCollageId);
      // La suscripción en tiempo real actualizará el estado `collages`
      return newCollageId; // Devolver el ID para permitir la navegación
    } catch (error) {
      console.error("Error agregando el collage:", error);
      setError(error);
      throw error; // Lanzar el error para que CreateCollage lo maneje
    }
  };

  if (loading) {
    return <p>Cargando collages...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="collage-page">
      <MiniNav
        className="mini-nav"
        isCreatingCollage={isCreatingCollage}
        setIsCreatingCollage={setIsCreatingCollage}
        onToggleCollagesList={toggleCollagesList}
      />

      <div className='render-content'>
        {/* Renderizar CreateCollage o ListCollages según el estado */}
        {isCreatingCollage ? (
          <CreateCollage
            onAddCollage={handleAddCollage}
            setIsCreatingCollage={setIsCreatingCollage}
          />
        ) : showCollagesList ? (
          <ListCollages
            collages={collages}
            onSelectCollage={handleSelectCollage}
            onDeleteCollage={handleDeleteCollage}
          />
        ) : (
          <div className="placeholder">
            {/* Puedes agregar contenido adicional aquí si no se está creando ni listando */}
            <p>Selecciona una opción del menú para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollagePage;
