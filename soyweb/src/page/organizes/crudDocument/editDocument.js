import React, { useState } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";

const EditDocument = ({ document, onCancel, onSave }) => {
    const [text, setText] = useState(document.texto);

    const handleSave = async () => {
        if (text.trim().length === 0 || text.trim().length > 500) {
            alert("El texto debe tener entre 1 y 500 palabras.");
            return;
        }

        try {
            const docRef = doc(db, "documentos", document.id);
            await updateDoc(docRef, { texto: text });
            onSave({ ...document, texto: text });
        } catch (error) {
            console.error("Error al actualizar documento:", error);
        }
    };

    return (
        <div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                rows="5"
                style={{ width: "100%" }}
            />
            <button onClick={handleSave}>Guardar Cambios</button>
            <button onClick={onCancel}>Cancelar</button>
        </div>
    );
};

export default EditDocument;
