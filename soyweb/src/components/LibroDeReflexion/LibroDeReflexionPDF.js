// src/components/LibroDeReflexion/LibroDeReflexionPDF.js

import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Registrar una fuente personalizada si lo deseas
// Font.register({
//   family: "Georgia",
//   src: "https://fonts.gstatic.com/s/georgia/v14/iJWKBXyloQkxErkA4jLYVQ.ttf",
// });

// Definir los estilos
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  encabezado: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "grey",
  },
  pieDePagina: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 12,
    color: "grey",
  },
  coverPage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingTop: 200,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333333",
  },
  subtitle: {
    fontSize: 24,
    marginBottom: 10,
    color: "#555555",
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
    color: "#777777",
  },
  tablaDeContenidos: {
    marginTop: 20,
  },
  tocTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333333",
  },
  tocItem: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555555",
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 10,
    color: "#444444",
    textTransform: "capitalize",
  },
  reflexionItem: {
    marginBottom: 15,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#888888",
  },
  reflexionNickname: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 3,
  },
  reflexionFecha: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 5,
  },
  reflexionTexto: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#555555",
  },
});

// Componente para la portada
const CoverPage = ({ usuario }) => (
  <Page style={styles.page}>
    <Text style={styles.encabezado}>Libro de Reflexión de {usuario.nombre}</Text>
    <View style={styles.coverPage}>
      {/* Opcional: Añadir una imagen como logo */}
      {/* <Image src="/path/to/logo.png" style={{ width: 100, height: 100, marginBottom: 20 }} /> */}
      <Text style={styles.title}>Mis Pensamientos</Text>
      <Text style={styles.subtitle}>{usuario.nombre}</Text>
      <Text style={styles.info}>Fecha de Nacimiento: {usuario.fechaNacimiento}</Text>
    </View>
    <Text
      style={styles.pieDePagina}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      fixed
    />
  </Page>
);

// Componente para la Tabla de Contenidos
const TablaDeContenidos = ({ categorias }) => (
  <Page style={styles.page}>
    <Text style={styles.encabezado}>Tabla de Contenidos</Text>
    <View style={styles.tablaDeContenidos}>
      <Text style={styles.tocTitle}>Tabla de Contenidos</Text>
      {categorias.map((categoria, index) => (
        <Text key={categoria} style={styles.tocItem}>
          {index + 1}. {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
        </Text>
      ))}
    </View>
    <Text
      style={styles.pieDePagina}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      fixed
    />
  </Page>
);

// Componente para cada categoría
const CategoriaPage = ({ categoria, reflexiones }) => (
  <Page style={styles.page}>
    <Text style={styles.encabezado}>Libro de Reflexión de {categoria.charAt(0).toUpperCase() + categoria.slice(1)}</Text>
    <View>
      <Text style={styles.categoryTitle}>{categoria}</Text>
      {reflexiones.map((reflexion) => (
        <View key={reflexion.id} style={styles.reflexionItem}>
          <Text style={styles.reflexionNickname}>{reflexion.nickname}</Text>
          <Text style={styles.reflexionFecha}>
            📅 {new Date(reflexion.fecha).toLocaleDateString()}
          </Text>
          <Text style={styles.reflexionTexto}>"{reflexion.texto}"</Text>
        </View>
      ))}
    </View>
    <Text
      style={styles.pieDePagina}
      render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      fixed
    />
  </Page>
);

// Componente principal del PDF
const LibroDeReflexionPDF = ({ usuario, categoriasReflexiones }) => (
  <Document>
    {/* Portada */}
    <CoverPage usuario={usuario} />

    {/* Tabla de Contenidos */}
    <TablaDeContenidos categorias={Object.keys(categoriasReflexiones)} />

    {/* Secciones por Categoría */}
    {Object.keys(categoriasReflexiones).map((categoria) => (
      <CategoriaPage
        key={categoria}
        categoria={categoria}
        reflexiones={categoriasReflexiones[categoria]}
      />
    ))}
  </Document>
);

export default LibroDeReflexionPDF;
