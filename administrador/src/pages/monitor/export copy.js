// Importaciones necesarias
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf"; // Para exportar a PDF
import html2canvas from "html2canvas"; // Para capturar la vista como imagen
import * as XLSX from "xlsx"; // Para exportar a Excel
import { collection, getDocs } from "firebase/firestore"; // Para interactuar con Firebase
import { db } from "../../firebase";
import "./export.css"; // CSS para el diseño
import { Bar, Doughnut, Pie } from "react-chartjs-2";

// Componente principal
const ExportPage = () => {
  // Estados para almacenar datos extraídos
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [mensajesProgramados, setMensajesProgramados] = useState([]);
  const [testigos, setTestigos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [resumenGeneral, setResumenGeneral] = useState(null); // Datos consolidados

  // Constantes para definir el layout y las métricas del informe
  const REPORT_TITLE = "Informe Consolidado del Sistema";
  const EXPORT_FILENAME_PDF = "informe_consolidado.pdf";
  const EXPORT_FILENAME_EXCEL = "informe_consolidado.xlsx";

  useEffect(() => {
    const fetchAndSetData = async () => {
      try {
        // Llama a la función de consolidación de datos
        const data = await consolidateData();

        // Actualiza los estados con los datos extraídos
        setBeneficiarios(data.totalBeneficiarios);
        setDocumentos(data.totalDocumentos);
        setEntradas(data.totalEntradas);
        setMensajesProgramados(data.mensajes);
        setSesiones(data.sesiones);
        setTestigos(data.totalTestigos);
        setUsuarios(data.totalUsuarios);
        setResumenGeneral(data);
      } catch (error) {
        console.error("Error al extraer los datos:", error);
      }
    };

    fetchAndSetData();
  }, []); // Solo se ejecuta al montar el componente

  // Función para extraer beneficiarios
  const fetchBeneficiarios = async () => {
    const snapshot = await getDocs(collection(db, "beneficiarios"));
    const beneficiarios = snapshot.docs.map((doc) => doc.data());
    return beneficiarios;
  };

  // Función para extraer documentos
  const fetchDocumentos = async () => {
    const snapshot = await getDocs(collection(db, "documentos"));
    const documentos = snapshot.docs.map((doc) => doc.data());
    return documentos;
  };

  // Función para extraer entradas
  const fetchEntradas = async () => {
    const snapshot = await getDocs(collection(db, "entradas"));
    const entradas = snapshot.docs.map((doc) => doc.data());
    return entradas;
  };

  // Función para extraer mensajes programados
  const fetchMensajesProgramados = async () => {
    const snapshot = await getDocs(collection(db, "mensajesprogramados"));
    const mensajes = snapshot.docs.map((doc) => doc.data());
    return mensajes;
  };

  // Función para extraer sesiones
  const fetchSesiones = async () => {
    const snapshot = await getDocs(collection(db, "sesiones"));
    const sesiones = snapshot.docs.map((doc) => doc.data());
    return sesiones;
  };

  // Función para extraer testigos
  const fetchTestigos = async () => {
    const snapshot = await getDocs(collection(db, "testigos"));
    const testigos = snapshot.docs.map((doc) => doc.data());
    return testigos;
  };

  // Función para extraer usuarios
  const fetchUsuarios = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const usuarios = snapshot.docs.map((doc) => {
      const userData = doc.data();
      const age =
        userData.birthDate && userData.birthDate.seconds
          ? new Date().getFullYear() -
            new Date(userData.birthDate.seconds * 1000).getFullYear()
          : "No disponible";
      return { ...userData, age };
    });
    return usuarios;
  };

  // Función para consolidar los datos
  const consolidateData = async () => {
    const [
      beneficiarios,
      documentos,
      entradas,
      mensajes,
      sesiones,
      testigos,
      usuarios,
    ] = await Promise.all([
      fetchBeneficiarios(),
      fetchDocumentos(),
      fetchEntradas(),
      fetchMensajesProgramados(),
      fetchSesiones(),
      fetchTestigos(),
      fetchUsuarios(),
    ]);

    // Calcular métricas generales
    const totalUsuarios = usuarios.length;
    const distribucionEdades = usuarios.reduce((acc, user) => {
      if (user.age !== "No disponible") {
        acc[user.age] = (acc[user.age] || 0) + 1;
      }
      return acc;
    }, {});

    const totalEntradas = entradas.length;
    const entradasPorNivel = entradas.reduce((acc, entrada) => {
      acc[entrada.nivel] = (acc[entrada.nivel] || 0) + 1;
      return acc;
    }, {});

    const totalDocumentos = documentos.length;
    const documentosPorTipo = documentos.reduce((acc, documento) => {
      acc[documento.tipo] = (acc[documento.tipo] || 0) + 1;
      return acc;
    }, {});

    const totalBeneficiarios = beneficiarios.length;
    const totalTestigos = testigos.length;

    const exportToPDF = async () => {
      const element = document.getElementById("export-container"); // ID del contenedor principal
      if (!element)
        return console.error("No se encontró el contenedor para exportar.");

      // Captura el contenido del contenedor como imagen
      const canvas = await html2canvas(element, { scale: 2 });
      const imageData = canvas.toDataURL("image/png");

      // Configura el PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Agrega la imagen al PDF
      pdf.addImage(imageData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(EXPORT_FILENAME_PDF); // Descarga el archivo PDF
    };

    const exportToExcel = () => {
      if (!resumenGeneral)
        return console.error("No hay datos para exportar a Excel.");

      // Datos básicos del resumen general
      const worksheetData = [
        ["Métrica", "Valor"],
        ["Usuarios Activos", usuarios],
        ["Beneficiarios Totales", beneficiarios],
        ["Testigos Totales", testigos],
        ["Entradas Totales", entradas],
        ["Documentos Totales", documentos],
        ["Mensajes Programados", mensajesProgramados],
        ["Sesiones Registradas", sesiones],
      ];

      // Crear hoja de cálculo y libro
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Informe General");

      // Descargar el archivo
      XLSX.writeFile(workbook, EXPORT_FILENAME_EXCEL);
    };


    // revisar este return
//     return (
//       <div className="export-container">
//         <h1> Exportar a pdf y exel</h1>
//         <h1 className="export-title">{REPORT_TITLE}</h1>
//         <div className="export-section">
//           <h2 className="export-subtitle">Resumen General</h2>
//           <ul className="export-summary-list">
//             <li>Total de Usuarios: {usuarios}</li>
//             <li>Total de Beneficiarios: {beneficiarios}</li>
//             <li>Total de Testigos: {testigos}</li>
//             <li>Total de Documentos: {documentos}</li>
//             <li>Total de Entradas: {entradas}</li>
//             <li>Total de Sesiones: {sesiones}</li>
//             <li>Mensajes Programados: {mensajesProgramados}</li>
//           </ul>
//         </div>

//         <div className="export-chart">
//           <h3>Distribución de Edades</h3>
//           <Bar
//             data={{
//               labels: Object.keys(resumenGeneral?.distribucionEdades || {}),
//               datasets: [
//                 {
//                   label: "Usuarios por Edad",
//                   data: Object.values(resumenGeneral?.distribucionEdades || {}),
//                   backgroundColor: "rgba(75, 192, 192, 0.6)",
//                 },
//               ],
//             }}
//             options={{ responsive: true, maintainAspectRatio: false }}
//           />
//         </div>

//         <div className="export-chart">
//           <h3>Entradas por Nivel</h3>
//           <Pie
//             data={{
//               labels: Object.keys(resumenGeneral?.entradasPorNivel || {}),
//               datasets: [
//                 {
//                   label: "Entradas",
//                   data: Object.values(resumenGeneral?.entradasPorNivel || {}),
//                   backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
//                 },
//               ],
//             }}
//             options={{ responsive: true, maintainAspectRatio: false }}
//           />
//         </div>

//         <div className="export-chart">
//           <h3>Documentos por Tipo</h3>
//           <Doughnut
//             data={{
//               labels: Object.keys(resumenGeneral?.documentosPorTipo || {}),
//               datasets: [
//                 {
//                   label: "Documentos",
//                   data: Object.values(resumenGeneral?.documentosPorTipo || {}),
//                   backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
//                 },
//               ],
//             }}
//             options={{ responsive: true, maintainAspectRatio: false }}
//           />
//         </div>

//         <div className="export-tables">
//           <h2 className="export-subtitle">Tablas de Datos</h2>
//           <table className="export-table">
//             <thead>
//               <tr>
//                 <th>Nivel de Seguridad</th>
//                 <th>Total de Entradas</th>
//               </tr>
//             </thead>
//             <tbody>
//               {resumenGeneral?.entradasPorNivel &&
//                 Object.entries(resumenGeneral.entradasPorNivel).map(
//                   ([nivel, total], index) => (
//                     <tr key={index}>
//                       <td>{nivel}</td>
//                       <td>{total}</td>
//                     </tr>
//                   )
//                 )}
//             </tbody>
//           </table>

//           <table className="export-table">
//             <thead>
//               <tr>
//                 <th>Tipo de Documento</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {resumenGeneral?.documentosPorTipo &&
//                 Object.entries(resumenGeneral.documentosPorTipo).map(
//                   ([tipo, total], index) => (
//                     <tr key={index}>
//                       <td>{tipo}</td>
//                       <td>{total}</td>
//                     </tr>
//                   )
//                 )}
//             </tbody>
//           </table>
//         </div>

//         <div className="export-actions">
//           <button onClick={exportToPDF} className="export-button">
//             Exportar a PDF
//           </button>
//           <button onClick={exportToExcel} className="export-button">
//             Exportar a Excel
//           </button>
//         </div>
//       </div>
//     );
//   };
// };

return(
    <h1 className="titulos"> Exportar a pdf y exel</h1>
);};};

export default ExportPage;
