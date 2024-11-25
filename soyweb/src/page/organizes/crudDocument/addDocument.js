import React, { useState, useEffect } from "react";
import { addDocument, getTestigos } from "../../../firebase";
import { useAuth } from "../../auth/authContext";
import "./AddDocument.css";

const AddDocument = ({ onAdd }) => {
    const { currentUser } = useAuth();
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [testigos, setTestigos] = useState([]);
    const [selectedTestigo, setSelectedTestigo] = useState("");

    useEffect(() => {
        const fetchTestigos = async () => {
            if (!currentUser) return;

            try {
                const fetchedTestigos = await getTestigos(currentUser.uid);
                setTestigos(fetchedTestigos);
            } catch (error) {
                console.error("Error al obtener testigos:", error);
            }
        };

        fetchTestigos();
    }, [currentUser]);

    const handleAdd = async () => {
        if (!currentUser) return;

        if (title.trim().length === 0) {
            alert("El documento debe tener un título.");
            return;
        }

        if (text.trim().length === 0 || text.trim().length > 500) {
            alert("El texto debe tener entre 1 y 500 palabras.");
            return;
        }

        if (!selectedTestigo) {
            alert("Debe seleccionar un testigo.");
            return;
        }

        try {
            const newDocument = await addDocument(currentUser.uid, {
                title,
                texto: text,
                testigo: selectedTestigo,
            });
            onAdd(newDocument);
            setTitle("");
            setText("");
            setSelectedTestigo("");
        } catch (error) {
            console.error("Error al agregar documento:", error);
        }
    };

    return (
        <div className="add-document-container">
            <h2>Agregar Documento</h2>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título del documento"
            />

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder="Escribe tu texto aquí (máximo 500 palabras)..."
                rows="5"
            />
            <select
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
            <button onClick={handleAdd} disabled={!text.trim() || !title.trim() || !selectedTestigo}>
                Guardar Documento
            </button>
        </div>
    );
};

export default AddDocument;
