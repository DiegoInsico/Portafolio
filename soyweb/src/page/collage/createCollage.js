// CreateCollage.js

import React, { useState } from 'react';
import Carousel from '../entry/entry';
import { useAuth } from '../../page/auth/authContext';
import Collage from './collage'; // Asegúrate de que la ruta sea correcta
import './CreateCollage.css';
import { useNavigate } from 'react-router-dom';
import EditableTitle from './editableTitle'; // Ya está creado

const CreateCollage = ({ onAddCollage, setIsCreatingCollage }) => {
    const { currentUser } = useAuth();
    const [collageName, setCollageName] = useState('');
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [thumbnail, setThumbnail] = useState(null); // Almacena el archivo de imagen
    const [isPreview, setIsPreview] = useState(true); // Estado para controlar la vista previa
    const navigate = useNavigate();

    // Declaraciones de consola mejoradas para diagnóstico
    console.log('Nombre del Collage:', collageName);
    console.log('Entradas Seleccionadas:', selectedEntries);

    const handleEntrySelect = (entry, isSelected) => {
        if (isSelected) {
            setSelectedEntries([...selectedEntries, entry.id]);
        } else {
            setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
        }
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file); // Almacena el archivo directamente
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
    };

    const handleCreateCollage = async () => {
        console.log('Iniciando la creación del collage...');
        console.log('Nombre del Collage:', collageName);
        console.log('Entradas Seleccionadas:', selectedEntries);
        console.log('Thumbnail:', thumbnail);

        if (!currentUser) {
            console.error('No hay un usuario autenticado');
            alert('Debes estar autenticado para crear un collage.');
            return;
        }

        if (!collageName.trim()) {
            alert('Por favor, ingresa un nombre para el collage.');
            return;
        }

        if (!thumbnail) {
            alert('Por favor, selecciona una imagen para la miniatura del collage.');
            return;
        }

        try {
            // Llama a onAddCollage pasando los parámetros correctos
            const newCollageId = await onAddCollage(collageName, selectedEntries, thumbnail);
            console.log('Collage creado con ID:', newCollageId);
            setIsCreatingCollage(false); // Cerrar el formulario de creación

            // Navegar a la página del nuevo collage
            navigate(`/collage/${newCollageId}`);
        } catch (error) {
            console.error('Error creando el collage', error);
            alert('Hubo un error al crear el collage. Por favor, inténtalo de nuevo.');
        }
    };

    const handleSaveCollage = () => {
        // Implementa la lógica para guardar los cambios realizados en el collage
        // Por ejemplo, actualizar propiedades en Firestore
        alert('Cambios guardados exitosamente.');
    };

    // Definir titleData con valores predeterminados para la vista previa
    const defaultTitleData = {
        position: { x: 50, y: 20 },
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        zIndex: 1
    };

    return (
        <div className='create-container'>
            <div className="carousel-container">
                <Carousel
                    currentUser={currentUser}
                    onEntrySelect={handleEntrySelect}
                    selectedEntries={selectedEntries}
                />
            </div>
            <div className="create-collage">
                <div className='collage-header'>
                    <div className="thumbnail-wrapper">
                        <input
                            type="file"
                            id="thumbnail-input"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="thumbnail-input" className="thumbnail-label">
                            {thumbnail ? (
                                <div className="thumbnail-container">
                                    <img src={URL.createObjectURL(thumbnail)} alt="Miniatura del collage" />
                                    <div className="remove-icon" onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveThumbnail();
                                    }}>
                                        &times;
                                    </div>
                                </div>
                            ) : (
                                <div className="thumbnail-placeholder">
                                    +
                                </div>
                            )}
                        </label>
                    </div>
                    {/* Título Editable */}
                    <EditableTitle title={collageName} setTitle={setCollageName} />
                </div>

                <div className='collage-content'>
                    {/* Vista Previa del Collage */}
                    <Collage
                        currentUser={currentUser}
                        collageName={collageName} // Añadido
                        setCollageName={setCollageName}
                        selectedEntries={selectedEntries}
                        collageId={null} // Pasar null para vista previa
                        titleData={defaultTitleData} // Pasar titleData predeterminado en preview
                        isPreview={isPreview} // Indica si es una vista previa
                    />
                </div>
            </div>
            <div className="button-container">
                {isPreview ? (
                    <button onClick={handleCreateCollage}>Crear Collage</button>
                ) : (
                    <button onClick={handleSaveCollage}>Guardar Cambios</button>
                )}
            </div>
        </div>
    );
};

export default CreateCollage;
