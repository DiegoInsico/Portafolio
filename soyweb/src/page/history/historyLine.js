// src/components/HistoryLine/HistoryLine.js

import React, { useRef, useEffect, useState } from 'react';
import './HistoryLine.css';
import { getEntries, getMensajesProgramados, getBeneficiarios } from '../../firebase'; // Asegúrate de ajustar la ruta
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MediaInstancia, SongInstancia, TextInstancia } from '../../components/Instancia/constructor'; // Ajusta la ruta si es necesario

// Función para agrupar instancias por año
function groupInstanciasByYear(instancias) {
    const groupedInstancias = {};

    instancias.forEach(instancia => {
        if (!instancia.fechaInstancia || !(instancia.fechaInstancia instanceof Date)) {
            console.warn(`Instancia con id ${instancia.id} tiene una fechaInstancia inválida:`, instancia.fechaInstancia);
            return; // Saltar esta instancia
        }

        const year = instancia.fechaInstancia.getFullYear();
        const key = `${year}`;

        if (!groupedInstancias[key]) {
            groupedInstancias[key] = [];
        }

        groupedInstancias[key].push(instancia);
    });

    // Ordenar las instancias en cada grupo por fecha de creación
    Object.values(groupedInstancias).forEach(instanciasInYear => {
        instanciasInYear.sort((a, b) => a.fechaInstancia - b.fechaInstancia);
    });

    return groupedInstancias;
}

const HistoryLine = ({ fechaNacimiento }) => {
    // Estados para manejar instancias, carga y errores
    const [instancias, setInstancias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Refs para manejar el contenedor de la línea de tiempo y el intervalo de scroll
    const timelineRef = useRef(null);
    const scrollIntervalRef = useRef(null);

    // Hook para obtener datos de Firebase
    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.uid;

                try {
                    setCargando(true); // Inicia el estado de carga

                    // Obtener datos en paralelo
                    const [entriesData, mensajesData, beneficiariosData] = await Promise.all([
                        getEntries(userId),
                        getMensajesProgramados(),
                        getBeneficiarios()
                    ]);

                    console.log('Entradas obtenidas:', entriesData); // Para depuración
                    console.log('Mensajes Programados obtenidos:', mensajesData); // Para depuración
                    console.log('Beneficiarios obtenidos:', beneficiariosData); // Para depuración

                    // Procesar entradas
                    const entries = entriesData.map(data => {
                        let fechaInstancia = data.fechaCreacion; // Objeto Date por defecto

                        if (data.categoria === 'recuerdo' && data.fechaRecuerdo) {
                            fechaInstancia = data.fechaRecuerdo;
                        }

                        if (data.media && data.mediaType) {
                            // Extraer la URL correcta
                            const mediaUrl = typeof data.media === 'string' ? data.media : data.media.albumImage || data.media.url;

                            return new MediaInstancia(
                                data.id,
                                data.categoria,
                                data.color,
                                data.emociones,
                                fechaInstancia,
                                data.fechaRecuerdo || null,
                                data.isProtected,
                                data.nivel,
                                data.texto,
                                data.userId,
                                mediaUrl, // Asegura que sea una URL de string
                                data.mediaType
                            );
                        } else if (data.cancion) {
                            return new SongInstancia(
                                data.id,
                                data.categoria,
                                data.color,
                                data.emociones,
                                fechaInstancia,
                                data.fechaRecuerdo || null,
                                data.isProtected,
                                data.nivel,
                                data.texto,
                                data.userId,
                                data.cancion
                            );
                        } else {
                            return new TextInstancia(
                                data.id,
                                data.categoria,
                                data.color,
                                data.emociones,
                                fechaInstancia,
                                data.fechaRecuerdo || null,
                                data.isProtected,
                                data.nivel,
                                data.texto,
                                data.userId
                            );
                        }
                    });

                    // Procesar mensajes programados
                    const mensajesProcesados = mensajesData.map(mensaje => {
                        const beneficiario = beneficiariosData.find(b => b.id === mensaje.beneficiarioId);
                        const nombreBeneficiario = beneficiario ? beneficiario.name : 'Desconocido';

                        return {
                            id: mensaje.id,
                            categoria: 'mensaje',
                            color: '#FFD700', // Color específico para mensajes
                            emociones: [],
                            fechaInstancia: mensaje.fechaEnvio, // Objeto Date
                            fechaRecuerdo: null,
                            isProtected: false,
                            nivel: '1',
                            texto: `Mensaje para ${nombreBeneficiario}`,
                            userId: mensaje.userId,
                            media: mensaje.media || null,
                            mediaType: mensaje.mediaType || null,
                            tipo: 'mensajeProgramado'
                        };
                    });

                    // Combinar entradas y mensajes
                    const todosLosEventos = [...entries, ...mensajesProcesados].map(evento => ({
                        ...evento,
                        fechaInstancia: evento.fechaInstancia instanceof Date ? evento.fechaInstancia : new Date(evento.fechaInstancia)
                    }));

                    // Crear el evento de nacimiento
                    const birthDate = typeof fechaNacimiento === 'string' ? new Date(fechaNacimiento) : fechaNacimiento;

                    const nacimientoEvento = {
                        fechaInstancia: birthDate,
                        titulo: 'Nacimiento',
                        descripcion: 'Fecha de nacimiento.',
                        color: '#e86971'
                    };

                    // Combinar el evento de nacimiento con los demás eventos
                    const todosLosEventosConNacimiento = [nacimientoEvento, ...todosLosEventos];

                    // Ordenar los eventos cronológicamente
                    todosLosEventosConNacimiento.sort((a, b) => a.fechaInstancia - b.fechaInstancia);

                    // Agrupar eventos por año
                    const groupedEvents = groupInstanciasByYear(todosLosEventosConNacimiento);

                    // Convertir el objeto de agrupación a un array ordenado
                    const sortedGroupKeys = Object.keys(groupedEvents).sort((a, b) => Number(a) - Number(b));

                    const eventosAgrupados = sortedGroupKeys.map(key => ({
                        key,
                        eventos: groupedEvents[key]
                    }));

                    setInstancias(eventosAgrupados);
                } catch (error) {
                    console.error('Error al obtener los datos:', error);
                    setError('Hubo un error al cargar los datos.');
                } finally {
                    setCargando(false); // Finaliza el estado de carga
                }
            } else {
                setError('Usuario no autenticado.');
                setCargando(false);
            }
        });

        return () => unsubscribe();
    }, [fechaNacimiento]); // Asegúrate de que 'fechaNacimiento' esté en las dependencias si puede cambiar

    // Hook para limpiar el intervalo de scroll al desmontar el componente
    useEffect(() => {
        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };
    }, []);

    // Función para calcular el ancho de la línea entre eventos
    const calcularAnchoLinea = (diferenciaTiempo, tiempoTotal) => {
        const proporcion = diferenciaTiempo / tiempoTotal;
        const anchoMaximoTotal = 2000; // Ancho máximo total de la línea de tiempo (ajusta según tus necesidades)
        const anchoLinea = proporcion * anchoMaximoTotal;

        // Establecer ancho mínimo y máximo para la línea entre eventos
        const anchoMinimo = 30; // Ancho mínimo de la línea entre eventos
        const anchoMaximo = 300; // Ancho máximo de la línea entre eventos

        const anchoFinal = Math.max(anchoMinimo, Math.min(anchoLinea, anchoMaximo));

        return `${anchoFinal}px`;
    };

    // Función para iniciar el desplazamiento
    const startScrolling = (direction) => {
        stopScrolling(); // Asegurarse de que no haya múltiples intervalos
        scrollIntervalRef.current = setInterval(() => {
            if (timelineRef.current) {
                timelineRef.current.scrollBy({
                    left: direction * 2, // Ajusta la velocidad aquí
                    behavior: 'smooth'
                });
            }
        }, 10); // Ajusta la frecuencia aquí
    };

    // Función para detener el desplazamiento
    const stopScrolling = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    // Renderizar mensajes condicionales antes de la línea de tiempo
    if (error) {
        return (
            <div className="history-line-card fade-in">
                <p>{error}</p>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="history-line-card fade-in">
                <p>Cargando datos...</p>
            </div>
        );
    }

    if (!instancias || instancias.length === 0) {
        return (
            <div className="history-line-card fade-in">
                <p>No hay eventos para mostrar.</p>
            </div>
        );
    }

    // Calcular el tiempo total entre el primer y el último evento
    const fechaInicio = instancias[0].eventos[0].fechaInstancia;
    const fechaFin = instancias[instancias.length - 1].eventos[instancias[instancias.length - 1].eventos.length - 1].fechaInstancia;
    const tiempoTotal = fechaFin - fechaInicio; // Tiempo total en milisegundos

    return (
        <div className="history-line-card fade-in">
            <h1 className="timeline-title">Línea de Vida</h1>
            <div className="timeline-wrapper">
                {/* Áreas de desplazamiento */}
                <div
                    className="scroll-area left"
                    onMouseEnter={() => startScrolling(-15)}
                    onMouseLeave={stopScrolling}
                ></div>
                <div
                    className="scroll-area right"
                    onMouseEnter={() => startScrolling(15)}
                    onMouseLeave={stopScrolling}
                ></div>

                {/* Contenedor de la línea de tiempo */}
                <div className="timeline-container" ref={timelineRef}>
                    <div className="horizontal-timeline">
                        {instancias.map((grupo, index) => (
                            <React.Fragment key={grupo.key}>
                                {/* Etiqueta del año */}
                                <div className="timeline-year-label">
                                    <div className="year-text">{grupo.key}</div>
                                </div>

                                {/* Eventos del año */}
                                {grupo.eventos.map((evento, idx) => {
                                    // Calcular la diferencia de tiempo desde el último evento
                                    let diferenciaTiempo = 0;
                                    if (index > 0 || idx > 0) {
                                        let fechaAnterior;
                                        if (idx > 0) {
                                            // Evento anterior en el mismo grupo
                                            fechaAnterior = grupo.eventos[idx - 1].fechaInstancia;
                                        } else {
                                            // Último evento del grupo anterior
                                            const grupoAnterior = instancias[index - 1];
                                            fechaAnterior = grupoAnterior.eventos[grupoAnterior.eventos.length - 1].fechaInstancia;
                                        }
                                        const fechaActual = evento.fechaInstancia;
                                        diferenciaTiempo = fechaActual - fechaAnterior;
                                    }

                                    return (
                                        <React.Fragment key={evento.id || idx}>
                                            {/* Línea entre eventos */}
                                            {(index > 0 || idx > 0) && (
                                                <div
                                                    className="line-between-events"
                                                    style={{
                                                        width: calcularAnchoLinea(diferenciaTiempo, tiempoTotal),
                                                    }}
                                                />
                                            )}

                                            {/* Evento */}
                                            <div className="timeline-event">
                                                <div
                                                    className="event-circle"
                                                    style={{ backgroundColor: evento.color || '#ccc' }}
                                                >
                                                    <div className="hover-card">
                                                        <h3>{evento.titulo}</h3>
                                                        <p>{evento.fechaInstancia.toLocaleDateString('es-ES', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}</p>
                                                        <p>
                                                            {typeof evento.descripcion === 'string'
                                                                ? evento.descripcion
                                                                : JSON.stringify(evento.descripcion)}
                                                        </p>
                                                        {evento.media && evento.mediaType === 'image' && (
                                                            <img
                                                                src={evento.media}
                                                                alt={evento.titulo}
                                                            />
                                                        )}
                                                        {evento.media && evento.mediaType === 'audio' && (
                                                            <audio controls>
                                                                <source src={evento.media} type="audio/mpeg" />
                                                                Tu navegador no soporta el elemento de audio.
                                                            </audio>
                                                        )}
                                                        {evento.cancion && evento.cancion.name && (
                                                            <div>
                                                                <p>
                                                                    <strong>Canción:</strong> {evento.cancion.name} by {evento.cancion.artist}
                                                                </p>
                                                                {evento.cancion.albumImage && (
                                                                    <img
                                                                        src={evento.cancion.albumImage}
                                                                        alt={`${evento.cancion.name} album art`}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="event-date">
                                                    {evento.fechaInstancia.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryLine;
