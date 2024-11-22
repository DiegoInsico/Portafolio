import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportButtons = ({ chartData }) => {
  const handleExportToPDF = () => {
    const doc = new jsPDF();
    Object.keys(chartData).forEach((chart) => {
      const data = chartData[chart];
      if (data) {
        const rows = data.labels.map((label, i) => [
          label,
          data.datasets[0].data[i],
        ]);
        doc.text(chart, 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 10);
        doc.autoTable({ head: [["Etiqueta", "Valor"]], body: rows });
      }
    });
    doc.save("Reportes_Graficos.pdf");
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    Object.keys(chartData).forEach((chart) => {
      const data = chartData[chart];
      if (data) {
        const rows = data.labels.map((label, i) => ({
          Etiqueta: label,
          Valor: data.datasets[0].data[i],
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, chart);
      }
    });
    XLSX.writeFile(workbook, "Reportes_Graficos.xlsx");
  };

  return (
    <div className="graph-export-buttons">
      <button onClick={handleExportToPDF}>Exportar a PDF</button>
      <button onClick={exportToExcel}>Exportar a Excel</button>
    </div>
  );
};

export default ExportButtons;
