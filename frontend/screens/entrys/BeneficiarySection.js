// BeneficiarySection.js
import React from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { Button, Avatar } from 'react-native-paper';

const BeneficiarySection = ({
  beneficiary,
  onChange,
  onRemove,
  onAdd,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Beneficiario</Text>
        <View style={styles.buttons}>
          {beneficiary ? (
            <>
              <Button
                mode="text"
                onPress={onChange}
                style={styles.button}
                icon="pencil"
                labelStyle={{ color: "#fff" }}
              >
                Cambiar
              </Button>
              <Button
                mode="text"
                onPress={onRemove}
                style={styles.button}
                icon="trash-can"
                color="#E74C3C"
              >
                Eliminar
              </Button>
            </>
          ) : (
            <Button
              mode="text"
              onPress={onAdd}
              style={styles.button}
              icon="plus"
              labelStyle={{ color: "#fff" }}
            >
              Añadir
            </Button>
          )}
        </View>
      </View>
      {beneficiary ? (
        <View style={styles.info}>
          {beneficiary.profileImage ? (
            <Avatar.Image
              size={50}
              source={{ uri: beneficiary.profileImage }}
              onError={() => {
                Alert.alert(
                  "Error",
                  "No se pudo cargar la imagen del beneficiario."
                );
              }}
            />
          ) : (
            <Avatar.Icon size={50} icon="account" />
          )}
          <Text style={styles.name}>{beneficiary.name}</Text>
        </View>
      ) : (
        <View style={styles.info}>
          <Avatar.Icon size={50} icon="account" />
          <Text style={styles.name}>Sin beneficiario</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttons: {
    flexDirection: "row",
  },
  button: {
    marginHorizontal: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#444",
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    marginLeft: 10,
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default BeneficiarySection;
