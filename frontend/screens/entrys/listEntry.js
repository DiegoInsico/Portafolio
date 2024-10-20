// src/screens/listEntry.js

import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import EntryItem from './entryItem'; // Asegúrate de que el archivo de EntryItem esté correctamente importado

const EntryListScreen = ({ entradas, onSelectEntry }) => {
  const renderItem = ({ item }) => (
    <EntryItem item={item} onPress={() => onSelectEntry(item)} /> // Pasa la entrada seleccionada
  );

  return (
    <FlatList
      data={entradas}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

EntryListScreen.propTypes = {
  entradas: PropTypes.array.isRequired, // Cambié "entries" a "entradas"
  onSelectEntry: PropTypes.func.isRequired, // Añade este prop para manejar la selección de la entrada
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
  },
});

export default EntryListScreen;
