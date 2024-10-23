import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth, updateProfile, deleteUser } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../utils/firebase"; // Firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const predefinedColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F1C40F', '#8E44AD', '#1ABC9C'];

const EditProfile = ({ navigation }) => {
    const [name, setName] = useState(''); // Nombre del usuario
    const [description, setDescription] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [personalityType, setPersonalityType] = useState('');
    const [belief, setBelief] = useState(''); // Nuevo campo para las creencias
    const [profileImage, setProfileImage] = useState(null);
    const [selectedColor, setSelectedColor] = useState('#FFFFFF'); // Color seleccionado
    const [loading, setLoading] = useState(false);

    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Obtener la información del perfil desde Firestore
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser) {
                const profileDoc = doc(db, "profiles", currentUser.email); // Usar el correo como identificador
                const profileSnapshot = await getDoc(profileDoc);

                if (profileSnapshot.exists()) {
                    const profileData = profileSnapshot.data();
                    setName(profileData.username || currentUser.displayName || '');
                    setDescription(profileData.description || '');
                    setZodiacSign(profileData.zodiacSign || '');
                    setPersonalityType(profileData.personalityType || '');
                    setBelief(profileData.belief || ''); // Recuperar creencias
                    setProfileImage(profileData.photoURL || null);
                    setSelectedColor(profileData.color || '#FFFFFF');
                } else {
                    // Si no existe el perfil, establecer los datos predeterminados desde Firebase Authentication
                    setName(currentUser.displayName || '');
                    setProfileImage(currentUser.photoURL || null);
                }
            }
        };

        fetchUserProfile();
    }, [currentUser]);

    // Función para elegir una imagen desde la galería
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Función para guardar los cambios
    const saveChanges = async () => {
        if (!name) {
            Alert.alert("Error", "El nombre de usuario no puede estar vacío.");
            return;
        }

        setLoading(true);

        try {
            // Subir la imagen si hay una imagen nueva seleccionada
            let photoURL = profileImage;
            if (profileImage && profileImage.startsWith("file://")) {
                const response = await fetch(profileImage);
                const blob = await response.blob();

                const storageRef = ref(storage, `profile_pics/${currentUser.uid}`);
                await uploadBytes(storageRef, blob);
                photoURL = await getDownloadURL(storageRef);
            }

            // Actualizar la información en Firebase Authentication (solo el nombre de usuario, no el correo ni la contraseña)
            await updateProfile(currentUser, {
                displayName: name,
                photoURL: photoURL,
            });

            // Guardar o actualizar la información en Firestore usando el correo como clave
            await setDoc(doc(db, "profiles", currentUser.email), {
                username: name,
                description,
                zodiacSign,
                personalityType,
                belief, // Guardar creencias
                photoURL: photoURL,
                color: selectedColor,
            }, { merge: true });

            Alert.alert('Cambios Guardados', 'Tu perfil ha sido actualizado.');
            navigation.goBack(); // Regresar a la pantalla anterior después de guardar
        } catch (error) {
            console.error("Error al guardar perfil: ", error);
            Alert.alert('Error', 'Hubo un problema al actualizar tu perfil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Perfil</Text>

            {/* Imagen de perfil en la parte superior, presionable para cambiar */}
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileCircleImage} />
                ) : (
                    <View style={styles.profilePlaceholderCircle}>
                        <Text style={styles.profilePlaceholderText}>IMG</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Nombre:</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Escribe tu nombre"
            />

            <Text style={styles.label}>Descripción:</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Escribe una breve descripción"
            />

            <Text style={styles.label}>Signo Zodiacal:</Text>
            <TextInput
                style={styles.input}
                value={zodiacSign}
                onChangeText={setZodiacSign}
                placeholder="Escribe tu signo zodiacal"
            />

            <Text style={styles.label}>Tipo de Personalidad:</Text>
            <TextInput
                style={styles.input}
                value={personalityType}
                onChangeText={setPersonalityType}
                placeholder="Escribe tu tipo de personalidad"
            />

            <Text style={styles.label}>Creencias:</Text>
            <TextInput
                style={styles.input}
                value={belief}
                onChangeText={setBelief}
                placeholder="Escribe tus creencias"
            />

            <Text style={styles.label}>Selecciona un color que te describa:</Text>
            <View style={styles.colorPalette}>
                {predefinedColors.map((color) => (
                    <TouchableOpacity
                        key={color}
                        style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            selectedColor === color && styles.selectedColor,
                        ]}
                        onPress={() => setSelectedColor(color)}
                    />
                ))}
            </View>
            <Text style={styles.selectedColorText}>Color Seleccionado: {selectedColor}</Text>

            {/* Botón para guardar cambios */}
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges} disabled={loading}>
                <Text style={styles.saveButtonText}>
                    {loading ? "Guardando..." : "Guardar Cambios"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop:50,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileCircleImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    profilePlaceholderCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E6E6E6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePlaceholderText: {
        fontSize: 16,
        color: '#A9A9A9',
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        borderColor: '#DDD',
        borderWidth: 1,
    },
    saveButton: {
        backgroundColor: '#4B4E6D',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    colorPalette: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    selectedColor: {
        borderWidth: 3,
        borderColor: '#000',
    },
    selectedColorText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
});

export default EditProfile;
