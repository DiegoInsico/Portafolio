// src/album/AlbumPage.jsx

import React, { useState, useEffect } from 'react';
import './AlbumPage.css';
import { useAuth } from '../auth/authContext';
import Album from './album';
import Carousel from '../entry/entry'; // Asegúrate de que la ruta y el nombre del componente sean correctos
import useEntries from '../entry/useEntries';
import MiniNav from './miniNav'; // Asegúrate de que la ruta y el nombre del componente sean correctos
import CreateAlbum from './crudAlbum/createAlbum';
import SelectedAlbum from './crudAlbum/selectedAlbum';

const AlbumPage = () => {
    const { currentUser, albums, addAlbum, modifyAlbum, removeAlbum } = useAuth();
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [activeOption, setActiveOption] = useState(null);
    const [localAlbumEntries, setLocalAlbumEntries] = useState([]);

    const {
        entries,
        albumEntries,
        albumBackground,
        loading,
        setAlbumBackground,
        updateAlbumEntries,
    } = useEntries(currentUser, selectedAlbum);

    useEffect(() => {
        if (Array.isArray(albums) && albums.length > 0 && !selectedAlbum) {
            setSelectedAlbum(albums[0]);
        }
    }, [albums, selectedAlbum]);

    useEffect(() => {
        if (Array.isArray(albumEntries)) {
            const entriesWithPosition = albumEntries.map(entry => ({
                ...entry,
                position: entry.position || { x: 0, y: 0 },
            }));
            setLocalAlbumEntries(entriesWithPosition);
        }
    }, [albumEntries]);

    const handleBackgroundChange = async (e) => {
        if (!selectedAlbum) return;
        const newColor = e.target.value;
        setAlbumBackground(newColor);
        await modifyAlbum(selectedAlbum.id, { backgroundColor: newColor });
    };

    const handleCreateAlbum = async (albumName, beneficiarioId) => {
        if (albumName.trim() === '' || beneficiarioId === '') return;
        try {
            await addAlbum(albumName, '#ffffff', beneficiarioId);
            setActiveOption(null);
        } catch (error) {
            console.error("Error al crear álbum:", error);
        }
    };

    const handleDeleteAlbum = async (albumId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este álbum?")) {
            try {
                await removeAlbum(albumId);
                if (selectedAlbum && selectedAlbum.id === albumId) {
                    const remainingAlbums = albums.filter(album => album.id !== albumId);
                    setSelectedAlbum(remainingAlbums.length > 0 ? remainingAlbums[0] : null);
                }
            } catch (error) {
                console.error("Error al eliminar álbum:", error);
            }
        }
    };

    const handleOptionClick = (option) => {
        if (activeOption === option) {
            setActiveOption(null);
        } else {
            setActiveOption(option);
        }
    };

    const handleAlbumSelect = (album) => {
        setSelectedAlbum(album);
        setActiveOption(null);
    };

    const handleEntrySelect = (entry) => {
        // Verifica si la entrada ya está en el collage
        const isSelected = localAlbumEntries.some(albumEntry => albumEntry.id === entry.id);

        if (isSelected) {
            // Si ya está, la removemos
            setLocalAlbumEntries(prevEntries =>
                prevEntries.filter(albumEntry => albumEntry.id !== entry.id)
            );
        } else {
            const totalEntries = localAlbumEntries.length;
            const textAreasCount = localAlbumEntries.filter(entry => entry.isTextArea).length;

            if (totalEntries - textAreasCount >= 15) {
                alert("No puedes agregar más de 15 entradas al collage.");
                return;
            }
            // Si no está, la agregamos con una posición inicial
            setLocalAlbumEntries(prevEntries => [
                ...prevEntries,
                { ...entry, position: { x: 0, y: 0 } }
            ]);
        }
    };

    const handleSaveAlbumChanges = async () => {
        if (!selectedAlbum) return;

        try {
            const entriesData = localAlbumEntries.map(entry => ({
                id: entry.id,
                position: entry.position,
            }));
            await updateAlbumEntries(modifyAlbum, selectedAlbum.id, entriesData);
            console.log("Cambios del álbum guardados correctamente");
            alert("Cambios guardados con éxito.");
        } catch (error) {
            console.error("Error al guardar los cambios del álbum:", error);
            alert("Ocurrió un error al guardar los cambios.");
        }
    };

    const renderContent = () => {
        switch (activeOption) {
            case 'crearAlbum':
                return (
                    <CreateAlbum onCreate={handleCreateAlbum} />
                );
            case 'tusAlbums':
                return (
                    <SelectedAlbum
                        albums={albums}
                        onSelect={handleAlbumSelect}
                        onDelete={handleDeleteAlbum}
                    />
                );
            case 'compartidosContigo':
                return (
                    <p>Aquí se mostrarán los collages compartidos contigo.</p>
                );
            default:
                return null;
        }
    };

    return (
        <div className="album-page-layout">
            {/* Nav Superior */}
            <MiniNav
                activeOption={activeOption}
                handleOptionClick={handleOptionClick}
            />
            {/* Contenido de la opción seleccionada */}
            {activeOption && (
                <div className="option-content">
                    {renderContent()}
                </div>
            )}
            {/* Carrusel de Entradas */}
            <div className='entries-carousel'>
                <Carousel
                    currentUser={currentUser}
                    onEntrySelect={handleEntrySelect}
                    selectedEntries={localAlbumEntries}
                />
            </div>
            {/* Contenido Principal del Álbum */}
            <div className='album-card'>
                <Album
                    selectedAlbum={selectedAlbum}
                    localAlbumEntries={localAlbumEntries}
                    setLocalAlbumEntries={setLocalAlbumEntries}
                />
            </div>
        </div>
    );
};

export default AlbumPage;
