import firebase_admin
from firebase_admin import credentials, firestore

# Ruta al archivo de credenciales JSON (asegúrate de que esté en la misma carpeta que este script)
CREDENTIALS_PATH = "cred.json"

# Archivo de salida
OUTPUT_FILE = "firebase_data_output.txt"

# Inicializar la app de Firebase
cred = credentials.Certificate(CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)

# Conectar a Firestore
db = firestore.client()

# Función para recorrer y guardar todos los datos
def save_all_data_to_file(collection_name, file):
    try:
        collection_ref = db.collection(collection_name)
        docs = collection_ref.stream()

        file.write(f"--- Colección: {collection_name} ---\n")
        for doc in docs:
            file.write(f"Documento ID: {doc.id}\n")
            data = doc.to_dict()
            for key, value in data.items():
                # Escribe el nombre del campo y su valor en el archivo
                file.write(f"  - {key}: {value}\n")
            file.write("\n")
        file.write("\n")
    except Exception as e:
        file.write(f"Error al leer la colección '{collection_name}': {e}\n")

# Especificar las colecciones que quieres explorar
collections = ["beneficiarios", "certificados", "documentos", "entradas", 
               "mensajesProgramados", "notifications", "pdfs", 
               "sessions", "solicitudes", "testigos", "tickets", "users"]

# Abrir el archivo para escribir la salida
with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    for collection in collections:
        save_all_data_to_file(collection, file)

print(f"Datos guardados en el archivo: {OUTPUT_FILE}")
