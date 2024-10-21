import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../utils/firebase'; // Asegúrate de tener la configuración correcta de Firestore

const DeleteAccount = () => {
  const auth = getAuth();

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (user) {
      // Confirmación del usuario
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          { text: "Eliminar", onPress: async () => await deleteUserAccount(user) }
        ]
      );
    }
  };

  const deleteUserAccount = async (user) => {
    try {
      // 1. Eliminar el documento del usuario en Firestore
      await deleteDoc(doc(db, "users", user.uid));
      console.log("Documento de usuario eliminado de Firestore");

      // 2. Eliminar el usuario de Firebase Authentication
      await user.delete();
      console.log("Usuario eliminado de Firebase Authentication");

      Alert.alert('Éxito', 'Tu cuenta ha sido eliminada exitosamente.');
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      Alert.alert('Error', 'Hubo un problema al eliminar tu cuenta. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View>
      <Text>Eliminar Cuenta</Text>
      <Button title="Eliminar mi cuenta" onPress={handleDeleteAccount} />
    </View>
  );
};

export default DeleteAccount;
