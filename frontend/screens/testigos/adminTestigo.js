import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, StyleSheet } from 'react-native';
import { db } from '../../utils/firebase'; // Asegúrate de que la ruta de Firebase sea correcta
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const AdminTesti = () => {
  const [testigos, setTestigos] = useState([]);
  const navigation = useNavigation();

  // Función para obtener los testigos de Firestore
  const fetchTestigos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'testigos'));
      const testigosList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      console.log('Testigos obtenidos:', testigosList); // Depuración: mostrar los testigos obtenidos
      setTestigos(testigosList);
    } catch (error) {
      console.error('Error al obtener los testigos:', error);
      Alert.alert('Error', 'No se pudieron obtener los testigos.');
    }
  };

  // Función para eliminar un testigo
  const eliminarTestigo = async (id) => {
    try {
      await deleteDoc(doc(db, 'testigos', id));
      Alert.alert('Éxito', 'Testigo eliminado correctamente.');
      fetchTestigos(); // Actualizar la lista de testigos
    } catch (error) {
      console.error('Error al eliminar testigo:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar el testigo.');
    }
  };

  useEffect(() => {
    fetchTestigos(); // Llamada para obtener los testigos al cargar la página
  }, []);

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.title}>Administrar Testigos</Text>

      {/* Botón para redirigir a la página de agregar testigos */}
      <TouchableOpacity style={localStyles.addButton} onPress={() => navigation.navigate('AgregarTest')}>
        <Text style={localStyles.buttonText}>Agregar Testigo</Text>
      </TouchableOpacity>

      {/* Lista de testigos */}
      <FlatList
        data={testigos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={localStyles.cardContainer}>
            {/* Miniatura de la imagen */}
            <Image
              source={{ uri: item.fotoUrl || 'https://via.placeholder.com/50' }} // Imagen por defecto si no hay URL
              style={localStyles.image}
            />

            {/* Información del testigo */}
            <View style={localStyles.infoContainer}>
              <Text style={localStyles.nameText}>{item.nombre || 'Nombre no disponible'}</Text>
              <Text style={localStyles.detailText}>{item.correo || 'Correo no disponible'}</Text>
              <Text style={localStyles.detailText}>{item.telefono || 'Teléfono no disponible'}</Text>
              <Text style={localStyles.detailText}>{item.circuloCercano || 'Circulo cercano no disponible'}</Text>
            </View>

            {/* Botones de modificar y eliminar */}
            <View style={localStyles.buttonsContainer}>
              <TouchableOpacity style={localStyles.modifyButton} onPress={() => navigation.navigate('ModificarTestigo', { id: item.id })}>
                <Text style={localStyles.buttonText}>Modificar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={localStyles.deleteButton} onPress={() => eliminarTestigo(item.id)}>
                <Text style={localStyles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={localStyles.emptyListText}>No hay testigos disponibles.</Text>
        )}
      />
    </View>
  );
};

// Estilos locales para ajustar el diseño de las cartas y botones
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50', // Verde
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 15,
    elevation: 3, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailText: {
    fontSize: 14,
    color: '#555',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modifyButton: {
    backgroundColor: '#4CAF50', // Verde
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#F44336', // Rojo
    borderRadius: 5,
    padding: 10,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});

export default AdminTesti;
