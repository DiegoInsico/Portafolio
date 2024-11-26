import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Ajusta la ruta según tu estructura

export async function getUserContext() {
  // Obtener datos de las colecciones
  const usersSnapshot = await getDocs(collection(db, "users"));
  const beneficiariosSnapshot = await getDocs(collection(db, "beneficiarios"));
  const certificadosSnapshot = await getDocs(collection(db, "certificados"));
  const documentosSnapshot = await getDocs(collection(db, "documentos"));

  const usersData = {};
  usersSnapshot.forEach((doc) => {
    const data = doc.data();
    const age = new Date().getFullYear() - new Date(data.birthDate.seconds * 1000).getFullYear();
    usersData[doc.id] = {
      age,
      testigos: 0, // Inicia en 0
      beneficiarios: 0,
      documentos: 0,
    };
  });

  // Procesar beneficiarios
  beneficiariosSnapshot.forEach((doc) => {
    const data = doc.data();
    if (usersData[data.userId]) {
      usersData[data.userId].beneficiarios += 1;
    }
  });

  // Procesar certificados
  certificadosSnapshot.forEach((doc) => {
    const data = doc.data();
    if (usersData[data.userId]) {
      usersData[data.userId].testigos += 1;
    }
  });

  // Procesar documentos
  documentosSnapshot.forEach((doc) => {
    const data = doc.data();
    if (usersData[data.userId]) {
      usersData[data.userId].documentos += 1;
    }
  });

  // Crear resumen
  const contextSummary = Object.keys(usersData).map((userId) => {
    const user = usersData[userId];
    return `1 usuario de la edad ${user.age} años tiene ${user.testigos} testigo(s), ${user.beneficiarios} beneficiario(s), y ${user.documentos} documento(s).`;
  });

  return contextSummary;
}
