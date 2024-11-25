import React, { useState, useEffect, useRef } from "react";
import { getDocuments, getUserById } from "../../firebase"; // Importa getUserById
import { useAuth } from "../auth/authContext";
import ListDocument from "./crudDocument/listDocument";
import AddDocument from "./crudDocument/addDocument";
import "./PageOrganize.css";

const DocumentManager = () => {
    const { currentUser } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState(null); // Estado para almacenar datos del usuario

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

    const handleOutsideClick = (event) => {
        // Verificar si el clic ocurrió fuera del contenido del modal
        if (event.target.classList.contains("modal-overlay")) {
            setShowModal(false);
        }
    };

    const handleAddDocument = (newDocument) => {
        setDocuments([...documents, newDocument]);
        setShowModal(false);
    };

    const handleUpdateDocument = (updatedDoc) => {
        setDocuments((prevDocs) =>
            prevDocs.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
        );
    };

    const handleDeleteDocument = (id) => {
        setDocuments(documents.filter((doc) => doc.id !== id));
    };

    useEffect(() => {
        fetchDocuments();
        fetchUserData();
    }, [currentUser]);

    if (loading) return <p>Cargando documentos...</p>;

    return (
        <div className="main-container">
            {/* Sección principal con diseño similar al ejemplo */}
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

            {/* Contenido adicional al desplazarse */}
            <section className="content-section">
                <header className="header">
                    <button className="add-button" onClick={() => setShowModal(true)}>
                        + Agregar Documento
                    </button>
                </header>
                <div className="listContainer">
                    {documents.length === 0 ? (
                        <p className="no-documents">No tienes documentos aún. ¡Agrega uno!</p>
                    ) : (
                        <ListDocument
                            documents={documents}
                            onUpdate={handleUpdateDocument}
                            onDelete={handleDeleteDocument}
                            userData={userData} // Pasa los datos del usuario
                        />
                    )}
                </div>
                {showModal && (
                    <div className="modal-overlay" onClick={handleOutsideClick}>
                        <div className="modal">
                            <button className="close-modal" onClick={() => setShowModal(false)}>
                                &times;
                            </button>
                            <AddDocument onAdd={handleAddDocument} />
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DocumentManager;
