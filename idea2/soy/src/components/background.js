import React from 'react';

const Background = ({ imageUrl }) => {
    const backgroundStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -2,
        backgroundImage: `url(${imageUrl})`,
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Capa oscura con opacidad
        zIndex: -1,
    };

    return (
        <>
            <div style={backgroundStyle}></div>
            <div style={overlayStyle}></div>
        </>
    );
};

export default Background;
