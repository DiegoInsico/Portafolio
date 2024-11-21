// Agrupar instancias por año y mes
function groupInstanciasByMonth(instancias) {
    const groupedInstancias = {};

    instancias.forEach(instancia => {
        const year = instancia.fechaInstancia.getFullYear();
        const month = instancia.fechaInstancia.getMonth();

        const key = `${year}-${month}`;
        if (!groupedInstancias[key]) {
            groupedInstancias[key] = [];
        }

        groupedInstancias[key].push(instancia);
    });

    // Ordenar las instancias en cada grupo por día de creación, del día 1 en adelante
    Object.values(groupedInstancias).forEach(instanciasInMonth => {
        instanciasInMonth.sort((a, b) => a.fechaInstancia.getDate() - b.fechaInstancia.getDate());
    });

    return groupedInstancias;
}
