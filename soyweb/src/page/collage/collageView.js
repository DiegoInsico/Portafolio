import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCollageById } from '../../firebase';
import CollageViewer from './CollageViewer';
import { useAuth } from '../../page/auth/authContext';
import './CollageView.css';

const CollageView = () => {
    const { id } = useParams();
    const [collage, setCollage] = useState(null);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCollage = async () => {
            try {
                const collageData = await getCollageById(id);
                if (collageData) {
                    setCollage(collageData);
                } else {
                    console.warn("Collage no encontrado");
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching collage:", error);
                navigate('/');
            }
        };

        if (id) {
            fetchCollage();
        }
    }, [id, navigate]);

    if (!collage) return <div>Cargando collage...</div>;
    console.log(collage.titleData)

    return (
        <div className='content-container'>
            <h1>{collage.name}</h1>
            <CollageViewer
                collageName={collage.name}
                titleData={collage.titleData}
                entries={collage.entries}
                collageId={collage.id}
                currentUser={currentUser}
            />
        </div>
    );
};

export default CollageView;
