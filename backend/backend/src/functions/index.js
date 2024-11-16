// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Función para detectar nuevos certificados subidos a Firebase Storage
exports.onNewCertificateUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    const bucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType; // e.g., image/jpeg
    const fileName = filePath.split("/").pop();

    // Verificar que el archivo esté en la carpeta 'certificados/'
    if (!filePath.startsWith("certificados/")) {
      console.log("Archivo no está en la carpeta de certificados. Ignorado.");
      return null;
    }

    // Obtener metadatos adicionales si es necesario
    const file = admin.storage().bucket(bucket).file(filePath);
    const [metadata] = await file.getMetadata();

    // Obtener la URL de descarga
    const downloadURL = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491", // Fecha futura para que la URL no expire
    });

    // Almacenar información en Firestore
    const certificadosRef = admin.firestore().collection("certificados");
    await certificadosRef.add({
      fileName: fileName,
      filePath: filePath,
      contentType: contentType,
      downloadURL: downloadURL[0],
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Nuevo certificado agregado a Firestore: ${fileName}`);
    return null;
  });
