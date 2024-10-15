import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // ===== Estilos Generales =====
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  containerF: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f0e6c0", // Color de fondo suave
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "90%",
    height: 40,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonF: {
    backgroundColor: "#3B873E",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    height: 60,
    marginVertical: 10,
  },
  buttonTextF: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginBottom: 15,
    width: "90%",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  // ===== Fondo General =====
  background: {
    flex: 1,
    backgroundColor:
      "linear-gradient(#D4AF37, #E6C47F, #C2A66B, #4B4E6D, #2C3E50)", // Gradiente
  },
  // Agrega este estilo para las imágenes en los cards
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  // Agrega estos estilos nuevos o ajusta los existentes en styles.js

cardRow: {
  flexDirection: 'row', // Para alinear el contenido en fila
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
  marginVertical: 5,
  borderRadius: 10,
  backgroundColor: '#f9f9f9',
  width: '100%',
  borderColor: '#ddd',
  borderWidth: 1,
},

cardContent: {
  flex: 1, // Para que ocupe el espacio restante entre la imagen y los botones
  paddingLeft: 10,
},

cardImage: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginRight: 10,
},

buttonGroup: {
  flexDirection: 'row', // Botones en fila
  alignItems: 'center',
},

buttonEdit: {
  backgroundColor: '#4CAF50',
  padding: 10,
  borderRadius: 5,
  marginRight: 10,
},

buttonDelete: {
  backgroundColor: '#F44336',
  padding: 10,
  borderRadius: 5,
},

buttonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
},

});

export default styles;
