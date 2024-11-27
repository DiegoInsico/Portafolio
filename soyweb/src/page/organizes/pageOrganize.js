// src/components/DocumentManager.js

import React, { useState, useEffect } from "react";
import {
    getDocuments,
    getUserById,
    uploadPdfToStorage,
    savePdfUrlInFirestore,
    deleteDocument
} from "../../firebase";
import { useAuth } from "../auth/authContext";
import ListDocument from "./crudDocument/listDocument";
import AddDocument from "./crudDocument/addDocument";
import EditDocument from "./crudDocument/editDocument";
import ConfirmDeleteModal from "./crudDocument/deleteDocument"; // Importa el nuevo modal
import { jsPDF } from "jspdf";
import "./PageOrganize.css";

const DocumentManager = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [signatureImage, setSignatureImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!currentUser) return;
            try {
                const userDocuments = await getDocuments(currentUser.uid);
                setDocuments(userDocuments);
            } catch (error) {
                console.error("Error al obtener documentos:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserData = async () => {
            if (!currentUser) return;
            try {
                const user = await getUserById(currentUser.uid);
                setUserData(user);
            } catch (error) {
                console.error("Error al obtener datos del usuario:", error);
            }
        };

        const fetchUserPdf = async () => {
            try {
                if (currentUser && currentUser.uid) {
                    const pdfDocRef = doc(db, "pdfs", currentUser.uid);
                    const pdfDoc = await getDoc(pdfDocRef);
                    if (pdfDoc.exists()) {
                        setPdfUrl(pdfDoc.data().url);
                    }
                }
            } catch (error) {
                console.error("Error al obtener el PDF del usuario:", error);
            }
        };

        fetchDocuments();
        fetchUserData();
        fetchUserPdf();
    }, [currentUser]);

    const confirmDeleteDocument = (doc) => {
        setDocumentToDelete(doc);
        setShowDeleteModal(true);
    };

    // Función para agregar un documento
    const handleAddDocument = (newDocument) => {
        setDocuments([...documents, newDocument]);
        setIsAdding(false);
    };

    // Función para actualizar un documento
    const handleUpdateDocument = (updatedDoc) => {
        setDocuments((prevDocs) =>
            prevDocs.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
        );
        setSelectedDocument(updatedDoc);
        setIsEditing(false);
    };

    // **Función para manejar la eliminación de un documento**
    const handleDeleteDocument = async () => {
        if (!documentToDelete) return;

        try {
            // Llama a la función deleteDocument para eliminar del Firestore
            await deleteDocument(documentToDelete.id);

            // Actualiza el estado local para eliminar el documento de la lista
            setDocuments(documents.filter((doc) => doc.id !== documentToDelete.id));

            // Si el documento eliminado está seleccionado, resetea la selección
            if (selectedDocument && selectedDocument.id === documentToDelete.id) {
                setSelectedDocument(null);
            }

            alert("Documento eliminado correctamente.");
        } catch (error) {
            console.error("Error al eliminar el documento:", error);
            alert("Hubo un error al eliminar el documento. Por favor, intenta nuevamente.");
        } finally {
            setShowDeleteModal(false); // Cierra el modal
            setDocumentToDelete(null);  // Resetea el documento a eliminar
        }
    };

    // Función para seleccionar un documento
    const handleSelectDocument = (doc) => {
        setSelectedDocument(doc);
        setIsAdding(false);
        setIsEditing(false);
    };

    const handleShowAdd = () => {
        setIsAdding(true);
        setSelectedDocument(null);
        setIsEditing(false);
    };

    const handleEditDocument = () => {
        setIsEditing(true);
        setIsAdding(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const generatePDFBlob = () => {
        const doc = new jsPDF();

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

            if (y > 250) {
                doc.addPage();
                y = 20;
            }
        });

        if (signatureImage && currentUser) {
            y += 10;
            doc.setFontSize(12);
            doc.text("Autorizado por:", 10, y);
            y += 10;

            doc.text(`${currentUser.displayName || "Nombre del Usuario"} (${currentUser.email})`, 10, y);
            y += 10;

            const imgProps = doc.getImageProperties(signatureImage);
            const imgWidth = 50;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            doc.addImage(signatureImage, 'PNG', 10, y, imgWidth, imgHeight);
            y += imgHeight + 10;
        }

        const pdfBlob = doc.output("blob");
        return pdfBlob;
    };

    const handleShowModal = () => {
        setShowModal(true);
    };

    const handleConfirmDownload = async () => {
        setUploading(true);
        setUploadError(null);
        try {
            const pdfBlob = generatePDFBlob();
            const userId = currentUser?.uid;

            if (!userId) {
                throw new Error("Usuario no autenticado.");
            }

            const uploadedPdfUrl = await uploadPdfToStorage(userId, pdfBlob);

            await savePdfUrlInFirestore(userId, uploadedPdfUrl);

            alert("PDF subido y guardado correctamente.");
            setPdfUrl(uploadedPdfUrl);
        } catch (error) {
            console.error("Error al guardar el PDF en Firebase:", error);
            setUploadError("Hubo un error al guardar el PDF. Intenta nuevamente.");
            alert("Hubo un error al guardar el PDF.");
        } finally {
            setUploading(false);
            setShowModal(false);
            setSignatureImage(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSignatureImage(null);
    };

    if (loading) return <p>Cargando documentos...</p>;

    return (
        <div className="main-container">
            {/* Hero Section */}

            <section className="hero-section">
                <div className="hero-left">
                    <h1>Ordena </h1>
                    <h1>Tu Vida</h1>
                </div>
                <div className="hero-right">
                    <p>
                        Este es el lugar donde puedes guardar todas tus pertenencias: correos
                        electrónicos, cuentas bancarias, seguros de vida y todo lo que consideres
                        relevante para tus seres queridos.
                    </p>
                </div>
            </section>

            {/* Content Section con efecto Parallax y estilo documento */}
            <div className="content-section">
                <div className="sidebar">
                    <button className="add-button" onClick={handleShowAdd}>
                        + Agregar Documento
                    </button>
                    <div className="listContainer">
                        {documents.length === 0 ? (
                            <p className="no-documents">No tienes documentos aún. ¡Agrega uno!</p>
                        ) : (
                            <ListDocument
                                documents={documents}
                                onDelete={confirmDeleteDocument} // Usa confirmDeleteDocument en lugar de handleDeleteDocument
                                onSelect={handleSelectDocument}
                                selectedDocumentId={selectedDocument ? selectedDocument.id : null}
                            />
                        )}
                    </div>
                    <div className="pdf-button-container">
                        <button className="generate-pdf-button" onClick={handleShowModal}>
                            Guardar Documentos como PDF
                        </button>
                    </div>
                </div>
                <div className="main-content">
                    <div className="parallax-container">
                        {isAdding && (
                            <AddDocument onAdd={handleAddDocument} />
                        )}
                        {!isAdding && isEditing && selectedDocument && (
                            <EditDocument
                                document={selectedDocument}
                                currentUser={currentUser}
                                onCancel={() => setIsEditing(false)}
                                onSave={handleUpdateDocument}
                            />
                        )}
                        {!isAdding && !isEditing && selectedDocument && (
                            <div className="document-details">
                                <h2>{selectedDocument.title}</h2>
                                <p dangerouslySetInnerHTML={{ __html: selectedDocument.texto.replace(/\n/g, '<br>') }}></p>
                                <p>
                                    <strong>Testigo:</strong> {selectedDocument.testigo}
                                </p>
                                <button
                                    className="edit-button"
                                    onClick={handleEditDocument}
                                >
                                    Editar Documento
                                </button>
                            </div>
                        )}
                        {!isAdding && !isEditing && !selectedDocument && (
                            <div className="welcome-message">
                                <h3>Selecciona un documento para ver los detalles o agrega uno nuevo.</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal para confirmar generación de PDF */}
            {showModal && (
                <div className="modal-confirm">
                    <div className="modal-content-confirm">
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
                                disabled={!signatureImage || uploading}
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

            {/* Mostrar PDF existente */}
            {pdfUrl && (
                <div className="existing-pdf">
                    <h3>Tu PDF Actual:</h3>
                    <iframe src={pdfUrl} title="PDF del Usuario" width="100%" height="600px"></iframe>
                </div>
            )}

            {/* Modal para Confirmar Eliminación */}
            {showDeleteModal && documentToDelete && (
                <ConfirmDeleteModal
                    document={documentToDelete}
                    onConfirm={handleDeleteDocument}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    );
};

export default DocumentManager;
