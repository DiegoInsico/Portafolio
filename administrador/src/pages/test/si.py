import json

# Datos JSON de ejemplo
data = [
    {
        "id": 1,
        "TipoEvento": "Desbosque sin autorización",
        "DescripcionEvento": "\n#. Área deforestada no autorizada sobre la Zona de Reserva del Oleoducto (*Depende de la zona del oleoducto en que se encuentre DV, ZR, FAR*). \n    Área Aprox.: ##.### m2 ",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\n - Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda. \n - Solicitar a la Jefatura Gestión Social Exploración & Oleoducto la realización de charlas de sensibilización a las Autoridades locales y habitantes de los Centros Poblados aledaños sobre los riesgos asociados de realizar actividades de fuego abierto en inmediaciones de esta infraestructura de transporte de Hidrocarburos Líquidos(considerar lenguas nativas). Los registros deberán ser remitidas a las Autoridades competentes.\n- Enviar cartas al Ministerio de la Producción, Ministerio de Agricultura y SANIPES, respecto a la normativa aplicable a las franjas de seguridad del ONP, solicitando acciones administrativas y regulatorias orientadas a evitar el desarrollo de actividades del sector en dichas franjas y la restauración de las áreas afectadas.\n- Restituir las condiciones originales del Bosque, programando campañas de reforestación en las de mayor riesgo."
    },
    {
        "id": 2,
        "TipoEvento": "Edificación no autorizada",
        "DescripcionEvento": "#. Cerca del sector se identificaron num (#) edificaciones no autorizadas, destinadas a vivienda o uso frecuente relacionado a la actividad agrícola - ganadera.",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\n - Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda. \n- Solicitar la restitución de las condiciones originales del terreno."
    },
    {
        "id": 3,
        "TipoEvento": "Incendio intencional",
        "DescripcionEvento": "#. Área de quema de vegetación no autorizada sobre la Zona de Reserva del Oleoducto (*Depende de la zona del oleoducto en que se encuentre DV, ZR, FAR*). \n    Área Aprox.: ##.### m2 ",
        "AccionesInmediatas": "- Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV. ZR y FAR).\n - Efectuar la denuncia ante la Policía Nacional del Perú - PNP, SERFOR y Fiscalía Especializada en Materia Ambiental (FEMA), según corresponda. \n - Solicitar a la Jefatura Gestión Social Exploración & Oleoducto la realización de charlas de sensibilización a las Autoridades locales y habitantes de los Centros Poblados aledaños sobre los riesgos asociados de realizar actividades de fuego abierto en inmediaciones de esta infraestructura de transporte de Hidrocarburos Líquidos(considerar lenguas nativas). Los registros deberán ser remitidas a las Autoridades competentes.\n- Enviar cartas al Ministerio de la Producción, Ministerio de Agricultura y SANIPES, respecto a la normativa aplicable a las franjas de seguridad del ONP, solicitando acciones administrativas y regulatorias orientadas a evitar el desarrollo de actividades del sector en dichas franjas y la restauración de las áreas afectadas.\n- Restituir las condiciones originales del terreno."
    },
    {
        "id": 4,
        "TipoEvento": "Maquinaria pesada no identificada",
        "DescripcionEvento": "#. Se detectó actividades de excavaciones y transporte de material  no autorizada con maquinaria (# retroexcavadora) sobre la Zona de Reserva del Oleoducto. ",
        "AccionesInmediatas": "- Solicitar al personal de Seguridad Patrimonial del Oleoducto la identificación de personas, vehículos y maquinaria; asi como, requerirles las Autorizaciones, Memoria descriptiva y Planos de las actividades que ejecutan.\n- Solicitar la paralización inmediata de las actividades que desarrollan sobre el Derecho de Vía (DV) y la Zona de Reserva (ZR); según corresponda.\n- Presentar las denuncias ante la Policía Nacional del Perú - PNP y la Fiscalía, según corresponda.\n- Solicitar la restitución de las condiciones originales del terreno"
    },
    {
        "id": 5,
        "TipoEvento": "Estanque Precario",
        "DescripcionEvento": "\n#. Estanque precario y sin impermeabilización sobre el Derecho de Vía.\n    Área Aprox.: #.### m2    ",
        "AccionesInmediatas": "- Drenar el estanque de agua debido a que incrementa la saturación de suelos y la suceptibilidad a la activación de asentamientos / deslizamientos (agravamiento del riesgo por geoamenazas)\n-Solicitar a Seguridad Patrimonial Oleoducto la identificación de las personas que ejecutan estas actividades en las franjas de seguridad del Oleoducto (DV, ZR y FAR).\n - Efectuar la denuncia ante la Policía Nacional del Perú - PNP, según corresponda.\n- Enviar cartas al Ministerio de la Producción, Ministerio de Agricultura y SANIPES, respecto a la normativa aplicable a las franjas de seguridad del ONP, solicitando acciones administrativas y regulatorias orientadas a evitar el desarrollo de actividades del sector en dichas franjas y la restauración de las áreas afectadas.\n- Restituir las condiciones originales del terreno."
    },
    {
        "id": 6,
        "TipoEvento": "Deslizamientos",
        "DescripcionEvento": "#. Deslizamiento de tierra sobre Derecho de vía",
        "AccionesInmediatas": "Restitución del drenaje para evitar acumulaciones y aumento de presión de poro.\nRemover el material acumulado sobre el Derecho de Vía. \nConstrucción de infraestructura de contención ante posible aceleración del deslizamiento."
    },
    {
        "id": 7,
        "TipoEvento": "Flujo de lodo",
        "DescripcionEvento": "#. Flujo de lodo sobre el Derecho de Vía",
        "AccionesInmediatas": "-Restitución del drenaje para evitar acumulaciones y aumento de presión de poro.\n-Remover el material acumulado sobre el Derecho de Vía. \n-Construcción de infraestructura de contención ante posible aceleración del deslizamiento."
    },
    {
        "id": 8,
        "TipoEvento": "Erosión del suelo ",
        "DescripcionEvento": "#. Se detectó deterioro del Derecho de Vía, por erosión hídrica",
        "AccionesInmediatas": "Se recomienda restituir las condiciones originales del Derecho de vía. Mejorar el drenaje en el área afectada"
    },
    {
        "id": 9,
        "TipoEvento": "Tubería Descubierta (En Zona de la Selva)",
        "DescripcionEvento": "#. Se identificó ##.## metros de tubería descubierta por erosión hídrica concentrada sobre el eje de la tubería, relacionado al \ndeterioro de las estructura de drenaje superficial del Derecho de Vía (rompientes y canales de derivación).",
        "AccionesInmediatas": "- Intervenir el segmento de tubería, evaluar revestimiento, definir daño mecánico y restituir condiciones de protección anti-corrosiva.\n- Asimismo, colocar señalética advirtiendo la presencia del Oleoducto en el sector. (esta recomendación se agrega sólo si hay actividad humana cercana)\n- Implementar el plan de comunicaciones para sensibilizar a los pobladores cercanos. (esta recomendación se agrega sólo si hay actividad humana cercana)\n- Reiterar la comunicación a las autoridades locales y pobladores de la zona, compartiendo la ubicación de la infraestructura del Oleoducto, franjas de seguridad según normativa vigente y los riesgos asociados de este Activo Crítico Nacional.\n- Restituir el material erosionado del cauce (tapada mínima de 0.9 m).\n- Restituir las estructuras de drenaje superficial en el Derecho de Vía, como rompientes, canales de derivación, cunetas, entre otros."
    },
    {
        "id": 10,
        "TipoEvento": "Tubería descubierta (En zona de Desierto)",
        "DescripcionEvento": " #. Se identificó ##.## metros de tubería descubierta por erosión hídrica estacional.\n#. Se identificó la erosión del \"lomo de pescado\" (barrera) en aprox. ## m en un sector que intersecta un curso hídrico estacional. (*si aplica*)",
        "AccionesInmediatas": "- Intervenir el segmento de tubería, evaluar revestimiento, definir daño mecánico y restituir condiciones de protección anti-corrosiva.\n- Restituir el material erosionado (tapada mínima de 0.9 m) correspondiente al ancho del cauce estacional (## m)."
    },
    {
        "id": 11,
        "TipoEvento": "Tubería descubierta (En paso de quebrada)",
        "DescripcionEvento": "#. Se identificó ## metros de tubería y contrapesos / lastre expuestos por erosión hídrica del lecho",
        "AccionesInmediatas": "- Intervenir el segmento de tubería, evaluar revestimiento, definir daño mecánico y restituir condiciones de protección anticorrosiva.\n- Mantener la limpieza y desbroce 50 m antes y después del cruce. (esta recomendación se agrega sólo si aplica)\n- Restituir el material erosionado del cauce (tapada mínima de 0.9 m), rigidizar el lecho con geomallas o gaviones o mantas de concreto. \n- Instalar barreras de sacrificio antes y posterior al cruce, con la finalidad de reducir la velocidad del flujo y favorecer la sedimentación.\n- Reiterar la comunicación a las autoridades locales y el MTC, compartiendo la ubicación de la infraestructura del Oleoducto, franjas de seguridad según normativa vigente y los riesgos asociados de este Activo Crítico Nacional. (esta recomendación se agrega sólo si hay vialidad cercana o centro poblado)"
    }
]   

# Generar el archivo HTML
html_content = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eventos</title>
</head>
<body>
    <h1>Lista de Eventos</h1>
"""

# Iterar sobre cada evento en el JSON y añadirlo al contenido HTML
for evento in data:
    html_content += f"""
    <div>
        <h2>{evento['TipoEvento']}</h2>
        <p><strong>Descripción:</strong> {evento['DescripcionEvento'].replace('\\n', '<br>')}</p>
        <p><strong>Acciones Inmediatas:</strong></p>
        <p>{evento['AccionesInmediatas'].replace('\\n', '<br>')}</p>
    </div>
    <hr>
    """

# Finalizar el contenido HTML
html_content += """
</body>
</html>
"""

# Escribir el contenido HTML en un archivo
with open("eventos.html", "w", encoding="utf-8") as file:
    file.write(html_content)

print("El archivo HTML se ha generado correctamente.")