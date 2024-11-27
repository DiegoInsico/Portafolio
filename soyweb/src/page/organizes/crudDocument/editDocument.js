import React, { useState, useEffect } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db, getTestigos } from "../../../firebase"; // Asegúrate de importar correctamente
import "./EditDocument.css";

const EditDocument = ({ document, onCancel, onSave, currentUser }) => {
    const [title, setTitle] = useState(document.title || "");
    const [selectedTestigo, setSelectedTestigo] = useState(document.testigo || "");
    const [texto, setTexto] = useState(document.texto || "");
    const [testigos, setTestigos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar la lista de testigos desde Firebase
    useEffect(() => {
        const fetchTestigos = async () => {
            if (!currentUser) return;

            try {
                const fetchedTestigos = await getTestigos(currentUser.uid);
                setTestigos(fetchedTestigos);

                // Preseleccionar el testigo del documento si existe
                if (document.testigo) {
                    const matchingTestigo = fetchedTestigos.find(
                        (testigo) => testigo.name === document.testigo
                    );
                    if (matchingTestigo) {
                        setSelectedTestigo(matchingTestigo.name);
                    }
                }
            } catch (error) {
                console.error("Error al obtener testigos:", error);
                setError("No se pudieron cargar los testigos.");
            }
        };

        fetchTestigos();
    }, [currentUser, document.testigo]);

    const handleSave = async () => {
        if (!title || !selectedTestigo || !texto) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const docRef = doc(db, "documentos", document.id);
            await updateDoc(docRef, {
                title,
                testigo: selectedTestigo,
                texto,
            });
            onSave({ ...document, title, testigo: selectedTestigo, texto });
        } catch (error) {
            console.error("Error al actualizar documento:", error);
            setError("Hubo un error al actualizar el documento. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-document-container">
            <h2>Editar Documento</h2>
            {error && <p className="error-message">{error}</p>}
            <form>
                <label htmlFor="title">Título del Documento</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ingrese el título del documento"
                    aria-required="true"
                />

                <label htmlFor="texto">Contenido</label>
                <textarea
                    id="texto"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Ingrese el contenido del documento"
                    rows="8"
                    aria-required="true"
                />

                <label htmlFor="testigo">Testigo</label>
                <select
                    id="testigo"
                    value={selectedTestigo}
                    onChange={(e) => setSelectedTestigo(e.target.value)}
                >
                    <option value="">Seleccione un testigo</option>
                    {testigos.map((testigo) => (
                        <option key={testigo.id} value={testigo.name}>
                            {testigo.name}
                        </option>
                    ))}
                </select>

                <button type="button" onClick={handleSave} disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="cancel-button"
                >
                    Cancelar
                </button>
            </form>
        </div>
    );
};

export default EditDocument;
