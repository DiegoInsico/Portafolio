import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react';
import Carousel from '../entry/entry';
import { useAuth } from '../../page/auth/authContext';
import Collage from './collageCreator';
import EditableTitle from './editableTitle';
import './CreateCollage.css';
import { useNavigate } from 'react-router-dom';

const CreateCollage = ({ setIsCreatingCollage, collageId }) => {
    const { currentUser } = useAuth();
    const [collageName, setCollageName] = useState('');
    const [selectedEntries, setSelectedEntries] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    // Estados locales para guardar el estado final del título y entradas
    const [finalEntries, setFinalEntries] = useState([]);
    const [finalTitleData, setFinalTitleData] = useState({
        position: { x: 50, y: 20 },
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        zIndex: 1
    });

    const navigate = useNavigate();

    const handleEntrySelect = (entry, isSelected) => {
        if (isSelected) {
            setSelectedEntries(prev => [...prev, {
                entryId: entry.id,
                position: { x: 100, y: 100 },
                size: { width: 300, height: 400 },
                backgroundColor: '#ffffff'
            }]);
        } else {
            setSelectedEntries(prev => prev.filter(e => e.entryId !== entry.id));
        }
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setThumbnail(file);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnail(null);
    };

    const updateCollageDoc = async (collageId, collageName, entries, thumbnail, titleData) => {
        // Subimos la miniatura al Storage
        const uniqueThumbnailName = `thumbnails/${collageId}-${thumbnail.name}`;
        const thumbnailRef = ref(storage, uniqueThumbnailName);
        await uploadBytes(thumbnailRef, thumbnail);
        const thumbnailURL = await getDownloadURL(thumbnailRef);

        // Actualizar el documento con nombre, thumbnail, entries y titleData finales
        const collageRef = doc(db, 'collages', collageId);
        await updateDoc(collageRef, {
            name: collageName,
            thumbnail: thumbnailURL,
            thumbnailPath: uniqueThumbnailName,
            entries: entries,
            titleData: titleData
        });

        return collageId;
    };

    const handleCreateCollage = async () => {
        if (!currentUser) {
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

        if (!collageId) {
            alert('No se ha podido crear el borrador del collage. Inténtalo de nuevo.');
            return;
        }

        try {
            // finalEntries y finalTitleData ya contienen el diseño actualizado desde Collage
            const updatedId = await updateCollageDoc(collageId, collageName, finalEntries, thumbnail, finalTitleData);
            console.log('Collage finalizado con ID:', updatedId);
            setIsCreatingCollage(false);
            navigate(`/collage/${updatedId}`);
        } catch (error) {
            console.error('Error creando el collage', error);
            alert('Hubo un error al crear el collage. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className='create-container'>
            <div className="carousel-container">
                <Carousel
                    currentUser={currentUser}
                    onEntrySelect={handleEntrySelect}
                    selectedEntries={selectedEntries.map(e => e.entryId)}
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
                    <EditableTitle title={collageName} setTitle={setCollageName} />
                </div>

                <div className='collage-content'>
                    {collageId && (
                        <Collage
                            currentUser={currentUser}
                            collageName={collageName}
                            setCollageName={setCollageName}
                            selectedEntries={selectedEntries}
                            collageId={collageId}
                            titleData={finalTitleData}
                            onTitleDataChange={setFinalTitleData}
                            onEntriesChange={setFinalEntries}
                            isPreview={false}
                            ownerId={currentUser ? currentUser.uid : null}
                        />
                    )}
                </div>
            </div>
            <div className="button-container">
                <button onClick={handleCreateCollage}>Crear Pensadero</button>
            </div>
        </div>
    );
};

export default CreateCollage;