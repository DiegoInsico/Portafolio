// src/album/crudAlbum/CreateAlbum.jsx

import React, { useState, useEffect } from 'react';
import { getBeneficiarios } from '../../../firebase';
import './CreateAlbum.css';

const CreateAlbum = ({ onCreate }) => {
    const [albumName, setAlbumName] = useState('');
    const [beneficiarioId, setBeneficiarioId] = useState('');
    const [beneficiarios, setBeneficiarios] = useState([]);

    useEffect(() => {
        const fetchBeneficiarios = async () => {
            const data = await getBeneficiarios();
            setBeneficiarios(data);
        };
        fetchBeneficiarios();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onCreate(albumName, beneficiarioId);
    };

    return (
        <div className="create-album">
            <h2>Crear Collage</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={albumName}
                    onChange={(e) => setAlbumName(e.target.value)}
                    placeholder="Nombre del Collage"
                />
                <select
                    value={beneficiarioId}
                    onChange={(e) => setBeneficiarioId(e.target.value)}
                >
                    <option value="">Selecciona un beneficiario</option>
                    {beneficiarios.map(beneficiario => (
                        <option key={beneficiario.id} value={beneficiario.id}>
                            {beneficiario.nombre}
                        </option>
                    ))}
                </select>
                <button type="submit">Crear Collage</button>
            </form>
        </div>
    );
};

export default CreateAlbum;
