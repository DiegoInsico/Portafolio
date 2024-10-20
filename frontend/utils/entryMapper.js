// utils/entradasMapper.js

/**
 * Mapea los datos de una entrada desde los inputs del formulario a la estructura deseada para Firestore.
 * @param {Object} formData - Datos del formulario de entrada.
 * @returns {Object} Objeto mapeado para Firestore.
 */
export const mapFormDataToFirestore = (formData) => {
    return {
        categoria: formData.categoria,
        texto: formData.texto || '',
        audio: formData.audio || '',
        cancion: formData.cancion || null,
        media: formData.media || '',
        mediaType: formData.mediaType || '',
        color: formData.color || '#ffffff',
        baul: formData.baul || false,
        fechaCreacion: formData.fechaCreacion, // Debería ser un Timestamp
        fechaRecuerdo: formData.fechaRecuerdo || null, // Debería ser un Timestamp si existe
        usuarioId: formData.usuarioId || null, // ID del usuario autenticado
    };
};
