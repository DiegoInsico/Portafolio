// src/screens/EditarPerfil.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Pressable,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { auth, storage } from '../../utils/firebase'; // Ajusta las rutas si es necesario
import { updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker'; // Para seleccionar imágenes
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Importar funciones de Firebase Storage

const EditarPerfil = ({ navigation }) => {
    const [displayName, setDisplayName] = useState(auth.currentUser.displayName || '');
    const [photoURL, setPhotoURL] = useState(auth.currentUser.photoURL || '');
    const [uploading, setUploading] = useState(false);

    // Función para seleccionar una imagen
    const pickImage = async () => {
        // Solicitar permisos de acceso a la galería
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Denegado', 'Necesitas dar permiso para acceder a las imágenes.');
            return;
        }

        // Abrir el selector de imágenes
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Imagen cuadrada
            quality: 0.5,
        });

        if (!result.cancelled) {
            uploadImage(result.uri);
        }
    };

    // Función para subir la imagen a Firebase Storage
    const uploadImage = async (uri) => {
        setUploading(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = uri.substring(uri.lastIndexOf('/') + 1);
            const storageRef = ref(storage, `profile_images/${filename}`);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            setPhotoURL(downloadURL);
            Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente.');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo subir la imagen.');
        } finally {
            setUploading(false);
        }
    };

    // Función para actualizar el perfil en Firebase Auth
    const handleUpdateProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'El nombre no puede estar vacío.');
            return;
        }

        setUploading(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName,
                photoURL,
            });
            Alert.alert('Éxito', 'Perfil actualizado correctamente.');
            navigation.goBack(); // Regresar a la pantalla anterior
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo actualizar el perfil.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

            {/* Imagen de Perfil */}
            <Pressable onPress={pickImage}>
                <Image
                    source={{ uri: photoURL || 'https://via.placeholder.com/100' }}
                    style={styles.profileImage}
                />
                <Text style={styles.changePhotoText}>Cambiar Foto de Perfil</Text>
            </Pressable>

            {/* Campo para el Nombre */}
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={displayName}
                onChangeText={setDisplayName}
            />

            {/* Botón para Actualizar el Perfil */}
            <Pressable style={styles.button} onPress={handleUpdateProfile} disabled={uploading}>
                {uploading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                )}
            </Pressable>
        </View>
    );
};

EditarPerfil.propTypes = {
    navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ccc',
    },
    changePhotoText: {
        color: '#3B873E',
        marginTop: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: '#3B873E',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditarPerfil;
