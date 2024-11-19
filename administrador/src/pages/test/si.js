console.log("sisi");

// Definimos el JSON como una cadena
const jsonData = `[
    {
        "id": 1,
        "TipoEvento": "Desbosque sin autorización",
        "DescripcionEvento": "#. Área deforestada no autorizada sobre la Zona de Reserva del Oleoducto (*Depende de la zona del oleoducto en que se encuentre DV, ZR, FAR*).\\nÁrea Aprox.: ##.### m2",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\\n- Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda.\\n- Solicitar a la Jefatura Gestión Social Exploración & Oleoducto la realización de charlas de sensibilización a las Autoridades locales y habitantes de los Centros Poblados aledaños sobre los riesgos asociados de realizar actividades de fuego abierto en inmediaciones de esta infraestructura de transporte de Hidrocarburos Líquidos (considerar lenguas nativas). Los registros deberán ser remitidos a las Autoridades competentes.\\n- Enviar cartas al Ministerio de la Producción, Ministerio de Agricultura y SANIPES, respecto a la normativa aplicable a las franjas de seguridad del ONP, solicitando acciones administrativas y regulatorias orientadas a evitar el desarrollo de actividades del sector en dichas franjas y la restauración de las áreas afectadas.\\n- Restituir las condiciones originales del Bosque, programando campañas de reforestación en las de mayor riesgo."
    },
    {
        "id": 2,
        "TipoEvento": "Edificación no autorizada",
        "DescripcionEvento": "#. Cerca del sector se identificaron num (#) edificaciones no autorizadas, destinadas a vivienda o uso frecuente relacionado a la actividad agrícola - ganadera.",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\\n- Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda.\\n- Solicitar la restitución de las condiciones originales del terreno."
    },
    {
        "id": 3,
        "TipoEvento": "Incendio intencional",
        "DescripcionEvento": "#. Área de quema de vegetación no autorizada sobre la Zona de Reserva del Oleoducto (*Depende de la zona del oleoducto en que se encuentre DV, ZR, FAR*).\\nÁrea Aprox.: ##.### m2",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\\n- Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda.\\n- Solicitar a la Jefatura Gestión Social Exploración & Oleoducto la realización de charlas de sensibilización a las Autoridades locales y habitantes de los Centros Poblados aledaños sobre los riesgos asociados de realizar actividades de fuego abierto en inmediaciones de esta infraestructura de transporte de Hidrocarburos Líquidos (considerar lenguas nativas). Los registros deberán ser remitidos a las Autoridades competentes.\\n- Enviar cartas al Ministerio de la Producción, Ministerio de Agricultura y SANIPES, respecto a la normativa aplicable a las franjas de seguridad del ONP, solicitando acciones administrativas y regulatorias orientadas a evitar el desarrollo de actividades del sector en dichas franjas y la restauración de las áreas afectadas.\\n- Restituir las condiciones originales del terreno."
    }
]`;
// Parseamos el JSON a un objeto JavaScript
const eventos = JSON.parse(jsonData);

// Seleccionamos el contenedor donde vamos a mostrar los eventos
const eventosContainer = document.getElementById('eventos-container');

// Recorremos el array de eventos
eventos.forEach(evento => {
    // Creamos un contenedor para cada evento
    const divEvento = document.createElement('div');

    // Agregamos contenido al contenedor
    divEvento.innerHTML = `
        <h2>${evento.TipoEvento}</h2>
        <p><strong>Descripción:</strong> ${evento.DescripcionEvento.replace(/\\n/g, '<br>')}</p>
        <p><strong>Acciones Inmediatas:</strong></p>
        <pre>${evento.AccionesInmediatas.replace(/\\n/g, '\n')}</pre>
    `;
    
    // Agregamos el contenedor del evento al contenedor principal
    eventosContainer.appendChild(divEvento);
});
