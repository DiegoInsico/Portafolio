// src/components/ListDocument.js

import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import {
    editDocument,
    getTestigos,
    uploadPdfToStorage,
    savePdfUrlInFirestore,
    db
} from "../../../firebase";
import { getDoc, doc } from "firebase/firestore"; // Importa getDoc y doc
import { useAuth } from "../../auth/authContext";
import "./ListDocument.css";

const ListDocument = ({ documents, onUpdate, onDelete }) => {
    // Uso correcto del hook useAuth para obtener currentUser
    const { currentUser } = useAuth();

    const [editingId, setEditingId] = useState(null);
    const [editedText, setEditedText] = useState("");
    const [editedTitle, setEditedTitle] = useState("");
    const [selectedTestigo, setSelectedTestigo] = useState("");
    const [testigos, setTestigos] = useState([]);
    const [showModal, setShowModal] = useState(false); // Estado para controlar el modal
    const [signatureImage, setSignatureImage] = useState(null); // Estado para la imagen de la firma
    const [uploading, setUploading] = useState(false); // Estado para indicar si está subiendo
    const [pdfUrl, setPdfUrl] = useState(null); // Estado para almacenar la URL del PDF existente
    const [uploadError, setUploadError] = useState(null); // Estado para errores de subida
    const modalRef = useRef(null); // Referencia para el contenido del modal

    // Obtener testigos al cargar el componente
    useEffect(() => {
        const fetchTestigos = async () => {
            try {
                if (documents.length > 0 && currentUser) {
                    // Usar currentUser.uid en lugar de documents[0]?.userId
                    const fetchedTestigos = await getTestigos(currentUser.uid);
                    setTestigos(fetchedTestigos);
                }
            } catch (error) {
                console.error("Error al obtener testigos:", error);
            }
        };

        fetchTestigos();
    }, [documents, currentUser]);

    // Obtener el PDF existente del usuario al cargar el componente
    useEffect(() => {
        const fetchUserPdf = async () => {
            try {
                if (currentUser && currentUser.uid) {
                    const pdfDocRef = doc(db, "pdfs", currentUser.uid);
                    const pdfDoc = await getDoc(pdfDocRef);
                    if (pdfDoc.exists()) {
                        setPdfUrl(pdfDoc.data().url);
                    } else {
                        console.log("No existe un PDF para el usuario:", currentUser.uid);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el PDF del usuario:", error);
            }
        };

        fetchUserPdf();
    }, [currentUser]);

    const handleEdit = (doc) => {
        if (editingId === doc.id) {
            saveChanges(doc);
        } else {
            setEditingId(doc.id);
            setEditedText(doc.texto);
            setEditedTitle(doc.title);
            setSelectedTestigo(doc.testigo || "");
        }
    };

    const handleOutsideClick = (event) => {
        // Verificar si el clic ocurrió fuera del contenido del modal
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            setShowModal(false);
            setSignatureImage(null); // Resetear la imagen al cerrar el modal
        }
    };

    useEffect(() => {
        // Agregar listener para clics en el documento cuando el modal está abierto
        if (showModal) {
            document.addEventListener("mousedown", handleOutsideClick);
        } else {
            document.removeEventListener("mousedown", handleOutsideClick);
        }

        // Limpiar el listener al desmontar el componente
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [showModal]);

    const handleCancel = () => {
        setEditingId(null);
        setEditedText("");
        setEditedTitle("");
        setSelectedTestigo("");
    };

    const saveChanges = async (doc) => {
        if (editedText.trim().length === 0 || editedText.trim().length > 500) {
            alert("El texto debe tener entre 1 y 500 palabras.");
            return;
        }

        const updatedData = {
            texto: editedText,
            title: editedTitle,
            testigo: selectedTestigo,
        };

        try {
            await editDocument(doc.id, updatedData);
            onUpdate({ ...doc, ...updatedData });
            setEditingId(null);
        } catch (error) {
            console.error("Error al actualizar documento:", error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureImage(reader.result); // Almacena la imagen en formato base64
            };
            reader.readAsDataURL(file);
        }
    };

    const generatePDFBlob = () => {
        const doc = new jsPDF();

        // Título del documento
        doc.setFontSize(20);
        doc.text("Documento Legal", doc.internal.pageSize.getWidth() / 2, 20, null, null, "center");

        let y = 30;

        documents.forEach((docData, index) => {
            doc.setFontSize(14);
            doc.text(`${index + 1}. ${docData.title || "Sin Título"}`, 10, y);
            y += 10;

            doc.setFontSize(12);
            doc.text(`Testigo: ${docData.testigo || "No asignado"}`, 10, y);
            y += 10;

            doc.text(`Contenido:`, 10, y);
            y += 10;

            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(docData.texto || "Sin contenido", 180);
            doc.text(splitText, 10, y);
            y += splitText.length * 10;

            if (y > 250) { // Ajustado para dejar espacio para la firma
                doc.addPage();
                y = 20;
            }
        });

        // Añadir la sección de autorización
        if (signatureImage && currentUser) {
            y += 10;
            doc.setFontSize(12);
            doc.text("Autorizado por:", 10, y);
            y += 10;

            // Añadir el nombre y correo del usuario
            doc.text(`${currentUser.displayName || "Nombre del Usuario"} (${currentUser.email})`, 10, y);
            y += 10;

            // Añadir la imagen de la firma
            const imgProps = doc.getImageProperties(signatureImage);
            const imgWidth = 50;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(signatureImage, 'PNG', 10, y, imgWidth, imgHeight);
            y += imgHeight + 10;
        }

        // Obtener el PDF como Blob
        const pdfBlob = doc.output("blob");
        return pdfBlob;
    };

    const handleShowModal = () => {
        setShowModal(true); // Mostrar el modal
    };

    const handleConfirmDownload = async () => {
        setUploading(true);
        setUploadError(null);
        try {
            const pdfBlob = generatePDFBlob(); // Generar el PDF como Blob
            const userId = currentUser?.uid; // Asegúrate de que currentUser contiene el ID del usuario

            if (!userId) {
                throw new Error("Usuario no autenticado.");
            }

            // Subir el archivo a Firebase Storage
            const uploadedPdfUrl = await uploadPdfToStorage(userId, pdfBlob);

            // Guardar la URL en Firestore
            await savePdfUrlInFirestore(userId, uploadedPdfUrl);

            alert("PDF subido y guardado correctamente.");
            setPdfUrl(uploadedPdfUrl); // Actualizar el estado con la nueva URL
        } catch (error) {
            console.error("Error al guardar el PDF en Firebase:", error);
            setUploadError("Hubo un error al guardar el PDF. Intenta nuevamente.");
            alert("Hubo un error al guardar el PDF.");
        } finally {
            setUploading(false);
            setShowModal(false); // Cerrar el modal
            setSignatureImage(null); // Resetear la imagen después de generar el PDF
        }
    };

    const handleCloseModal = () => {
        setShowModal(false); // Cerrar el modal sin descargar
        setSignatureImage(null); // Resetear la imagen al cerrar el modal
    };

    return (
        <div className="documents-container">
            <div className="documents-grid">
                {documents.map((doc) => (
                    <div className="document-card" key={doc.id}>
                        {editingId === doc.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    placeholder="Título del documento"
                                    className="document-edit-title"
                                />
                                <select
                                    value={selectedTestigo}
                                    onChange={(e) => setSelectedTestigo(e.target.value)}
                                    className="document-edit-select"
                                >
                                    <option value="">Seleccione un testigo</option>
                                    {testigos.map((testigo) => (
                                        <option key={testigo.id} value={testigo.name}>
                                            {testigo.name}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    maxLength={500}
                                    rows="5"
                                    className="document-edit-text"
                                />
                                <div className="document-actions">
                                    <button onClick={() => handleEdit(doc)}>Guardar</button>
                                    <button onClick={handleCancel}>Cancelar</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="document-header">
                                    <label className="document-title">{doc.title || "Sin Título"}</label>
                                    <div className="document-actions-left">
                                        <button onClick={() => handleEdit(doc)}>Editar</button>
                                        <button onClick={() => onDelete(doc.id)}>Eliminar</button>
                                    </div>
                                </div>
                                <div className="document-content">
                                    <p>{doc.texto || "Sin contenido"}</p>
                                </div>
                                <div className="document-details">
                                    <p>
                                        <span>Testigo:</span> {doc.testigo || "No asignado"}
                                    </p>
                                    <p>
                                        Creado el:{" "}
                                        {doc.createdAt?.seconds
                                            ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString()
                                            : "Fecha desconocida"}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="pdf-button-container">
                <button className="generate-pdf-button" onClick={handleShowModal}>
                    Guardar Documentos como PDF
                </button>
            </div>

            {/* Mostrar el PDF existente si está disponible */}
            {pdfUrl && (
                <div className="existing-pdf">
                    <h3>Tu PDF Actual:</h3>
                    <iframe src={pdfUrl} title="PDF del Usuario" width="100%" height="600px"></iframe>
                    {/* O bien, un enlace para abrir en una nueva pestaña */}
                    {/* <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Ver PDF</a> */}
                </div>
            )}

            {/* Modal de confirmación */}
            {showModal && (
                <div className="modal-confirm">
                    <div className="modal-content-confirm" ref={modalRef}>
                        <h2>Confirmar Subida de PDF</h2>
                        <p>
                            Por favor, sube tu firma actual con tu nombre. Es necesario para autorizar el documento legal.
                        </p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="signature-upload"
                        />
                        {signatureImage && (
                            <div className="signature-preview">
                                <p>Vista previa de la firma:</p>
                                <img src={signatureImage} alt="Firma" />
                            </div>
                        )}
                        <div className="modal-actions-confirm">
                            <button
                                onClick={handleConfirmDownload}
                                disabled={!signatureImage || uploading} // Deshabilitar si no hay imagen o está subiendo
                            >
                                {uploading ? "Subiendo..." : "Aceptar"}
                            </button>
                            <button onClick={handleCloseModal} disabled={uploading}>
                                Cancelar
                            </button>
                        </div>
                        {uploadError && <p className="error-message">{uploadError}</p>}
                    </div>
                </div>
            )}
        </div>
    );

};

export default ListDocument;
