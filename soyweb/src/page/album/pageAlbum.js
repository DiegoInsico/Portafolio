import React from 'react';
import Album from './album';
import './AlbumPage.css';

const AlbumPage = () => {
    return (
        <div className="main">
            <div className='AlbumCard'>
                <Album />
            </div>
        </div>
    );
};

export default AlbumPage;
