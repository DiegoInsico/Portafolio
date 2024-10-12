export const transformData = (entradas) => {
    // Verifica si 'entradas' es un array, de lo contrario, asigna un array vacío
    const validEntradas = Array.isArray(entradas) ? entradas : [];
  
    return {
      name: 'Raíz',
      children: validEntradas.map((entrada) => ({
        name: entrada.mensaje,
        attributes: {
          id: entrada.id,
          mensaje: entrada.mensaje,
          categoria: entrada.categoria,
          media_url: entrada.media_url,
          fecha_creacion: entrada.fecha_creacion,
        },
      })),
    };
  };
  