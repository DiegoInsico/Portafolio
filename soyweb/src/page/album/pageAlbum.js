import React, { useState, useEffect } from 'react';
import './AlbumPage.css';
import { useAuth } from '../auth/authContext';
import Album from './album';
import EntriesManager from '../entry/entry';
import useEntries from '../entry/useEntries';
import SideMenu from './sideMenu';
import CreateAlbum from './crudAlbum/createAlbum';
import ListAlbums from './crudAlbum/listAlbums';
import SelectedAlbum from './crudAlbum/selectedAlbum';

const AlbumPage = () => {
    const { currentUser, albums, addAlbum, modifyAlbum, removeAlbum } = useAuth();
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);
    const [activeOption, setActiveOption] = useState(null);
    const [newAlbumName, setNewAlbumName] = useState('');
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
            setNewAlbumName('');
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

    const handleEntryClick = (entry) => {
        if (!selectedAlbum) return;

        const isSelected = localAlbumEntries.some(albumEntry => albumEntry.id === entry.id);

        if (isSelected) {
            setLocalAlbumEntries(prevEntries =>
                prevEntries.filter(albumEntry => albumEntry.id !== entry.id)
            );
        } else {
            if (localAlbumEntries.length >= 15) {
                alert("No puedes agregar más de 15 entradas a un álbum.");
                return;
            }
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

    const toggleMenu = () => {
        setIsMenuExpanded(!isMenuExpanded);
        if (isMenuExpanded) {
            setActiveOption(null);
        }
    };

    const renderContent = () => {
        switch (activeOption) {
            case 'crearAlbum':
                return (
                    <CreateAlbum onCreate={handleCreateAlbum} />
                );
            case 'listarAlbums':
                return (
                    <ListAlbums albums={albums} onDelete={handleDeleteAlbum} />
                );
            case 'tusAlbums':
                return (
                    <SelectedAlbum albums={albums} onSelect={handleAlbumSelect} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="album-page-layout">
            {/* Menú Lateral Izquierdo */}
            <SideMenu
                isExpanded={isMenuExpanded}
                toggleMenu={toggleMenu}
                activeOption={activeOption}
                handleOptionClick={handleOptionClick}
            />
            {/* Contenedor de Opciones Activas */}
            {activeOption && (
                <div className={`options-container ${isMenuExpanded ? 'expanded' : 'collapsed'}`}>
                    {renderContent()}
                </div>
            )}
            <div className='entries-manager'>
                <EntriesManager
                    entries={entries}
                    albumEntries={albumEntries}
                    selectedAlbum={selectedAlbum}
                    onEntryClick={handleEntryClick}
                />
            </div>
            {/* Contenido Principal del Álbum */}
            <div className='album-card'>
                <Album
                    selectedAlbum={selectedAlbum}
                    onBackgroundChange={handleBackgroundChange}
                    localAlbumEntries={localAlbumEntries}
                    handleSaveAlbumChanges={handleSaveAlbumChanges}
                />
            </div>
        </div>
    );
};

export default AlbumPage;
