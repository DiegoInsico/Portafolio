// src/pages/Home.js

import React from 'react';
import './Home.css';
import HistoryLine from '../history/historyLine';
import Album from '../album/album';

const Home = () => {


    return (
        <div className='main'>
            <section id="home" className="section home fade-in">
                <h1>Bienvenido a Soy</h1>
                <p>Tu lugar seguro</p>
            </section>

            <section id="historia" className="section historia fade-in">
                <p>Componente Uno (Historia de vida)</p>
                <div className="history-line-card">
                    <HistoryLine />
                </div>
            </section>

            <section id="album" className="section album fade-in">
                <div className='AlbumCard'>
                    <Album/>
                </div>
            </section>

            <section id="ordena" className="section ordena fade-in">
                <p>Componente Tres (Ordena tu vida)</p>
            </section>

            <section id="footer" className="section footer fade-in">
                <p>Footer</p>
            </section>
        </div>
    );
};

export default Home;
