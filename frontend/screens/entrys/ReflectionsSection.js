// ReflectionsSection.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const ReflectionsSection = ({ onAdd, onView }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reflexiones</Text>
      <View style={styles.buttons}>
        <Button
          mode="contained"
          onPress={onAdd}
          style={styles.addButton}
          icon="plus"
        >
          Agregar Reflexión
        </Button>
        <Button
          mode="outlined"
          onPress={onView}
          style={styles.viewButton}
          icon="eye"
          labelStyle={{ color: "#fff" }}
        >
          Ver Reflexiones
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10,
  },
  addButton: {
    backgroundColor: "#444",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
  viewButton: {
    borderColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "45%",
  },
});

export default ReflectionsSection;
