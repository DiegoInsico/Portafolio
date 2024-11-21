// src/components/Instancia/constructor.js

// Modelo base para todas las instancias
export class Instancia {
    constructor(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId) {
        this.id = id;
        this.categoria = categoria;
        this.color = color;
        this.emociones = emociones;
        this.fechaCreacion = new Date(fechaCreacion);
        this.fechaRecuerdo = fechaRecuerdo ? new Date(fechaRecuerdo) : null;
        this.isProtected = isProtected;
        this.nivel = nivel;
        this.texto = texto;
        this.userId = userId;
        this.fechaInstancia = this.fechaRecuerdo || this.fechaCreacion; // Usar fechaRecuerdo si está disponible
    }
}

// Modelo de instancia tipo Media-Texto o Audio
export class MediaInstancia extends Instancia {
    constructor(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId, media, mediaType) {
        super(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId);
        this.media = media;
        this.mediaType = mediaType;
    }
}

// Modelo de instancia tipo Cancion-Texto o Audio
export class SongInstancia extends Instancia {
    constructor(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId, cancion) {
        super(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId);
        this.cancion = cancion;
    }
}

// Modelo de instancia tipo Texto o Audio
export class TextInstancia extends Instancia {
    constructor(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId) {
        super(id, categoria, color, emociones, fechaCreacion, fechaRecuerdo, isProtected, nivel, texto, userId);
    }
}
