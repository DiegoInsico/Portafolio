// src/album/CreateAlbum.jsx

import React, { useState, useEffect } from 'react';
import { getBeneficiarios } from '../../../firebase';
import './CreateAlbum.css';

const CreateAlbum = ({ onCreate }) => {
    const [albumName, setAlbumName] = useState('');
    const [beneficiarios, setBeneficiarios] = useState([]);
    const [selectedBeneficiario, setSelectedBeneficiario] = useState('');

    useEffect(() => {
        const fetchBeneficiarios = async () => {
            try {
                const fetchedBeneficiarios = await getBeneficiarios();
                setBeneficiarios(fetchedBeneficiarios);
            } catch (error) {
                console.error("Error al obtener beneficiarios:", error);
            }
        };
        fetchBeneficiarios();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (albumName.trim() === '' || selectedBeneficiario === '') {
            alert("Por favor, ingresa un nombre y selecciona un beneficiario.");
            return;
        }
        onCreate(albumName, selectedBeneficiario);
    };

    return (
        <div className="create-album-container">
            <h2>Crear Nuevo Álbum</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre del nuevo álbum"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    className="create-album-input"
                />
                <label htmlFor="beneficiario-select">Selecciona un Beneficiario:</label>
                <select
                    id="beneficiario-select"
                    value={selectedBeneficiario}
                    onChange={(e) => setSelectedBeneficiario(e.target.value)}
                    className="beneficiario-select"
                >
                    <option value="">--Selecciona--</option>
                    {beneficiarios.map(beneficiario => (
                        <option key={beneficiario.id} value={beneficiario.id}>
                            {beneficiario.nombre} {/* Ajusta según la estructura de beneficiario */}
                        </option>
                    ))}
                </select>
                <button type="submit" className="create-album-button">
                    Crear Álbum
                </button>
            </form>
        </div>
    );
};

export default CreateAlbum;
