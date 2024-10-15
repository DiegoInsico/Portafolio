import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Definir algunos colores preseleccionados
const predefinedColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#F1C40F', '#8E44AD', '#1ABC9C'];

const EditProfile = ({ navigation }) => {
    const [name, setName] = useState('Nombre de Usuario');
    const [email, setEmail] = useState('correo@ejemplo.com');
    const [password, setPassword] = useState('');
    const [description, setDescription] = useState('');
    const [zodiacSign, setZodiacSign] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [selectedOption, setSelectedOption] = useState('perfil'); // 'perfil' o 'opcionesPerfil'
    const [selectedColor, setSelectedColor] = useState('#FFFFFF'); // Color por defecto

    // Función para elegir una imagen desde la galería
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        // Asegurarte de que la respuesta tenga la estructura correcta
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setProfileImage(result.assets[0].uri); // Guardar la URI de la imagen seleccionada
        }
    };

    // Función para guardar los cambios
    const saveChanges = () => {
        Alert.alert('Cambios Guardados', 'Tu perfil ha sido actualizado.');
        navigation.goBack(); // Regresar a la pantalla anterior después de guardar
    };

    // Renderizar el contenido según la opción seleccionada
    const renderContent = () => {
        if (selectedOption === 'opcionesPerfil') {
            return (
                <>
                    <Text style={styles.label}>Correo Electrónico:</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Escribe tu correo"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Contraseña:</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Escribe tu contraseña"
                        secureTextEntry
                    />
                </>
            );
        } else {
            return (
                <>
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
                </>
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Botón para regresar a Home */}
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                <Text style={styles.backButtonText}>Volver a Home</Text>
            </TouchableOpacity>

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

            {/* Selector entre Opciones de Perfil y Perfil */}
            <View style={styles.selectorContainer}>
                <TouchableOpacity
                    style={[styles.selectorButton, selectedOption === 'perfil' && styles.selectedButton]}
                    onPress={() => setSelectedOption('perfil')}
                >
                    <Text style={styles.selectorText}>Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.selectorButton, selectedOption === 'opcionesPerfil' && styles.selectedButton]}
                    onPress={() => setSelectedOption('opcionesPerfil')}
                >
                    <Text style={styles.selectorText}>Opciones de Perfil</Text>
                </TouchableOpacity>
            </View>

            {/* Renderiza el contenido según la opción seleccionada */}
            {renderContent()}

            {/* Botón para guardar cambios */}
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonText: {
        color: '#4B4E6D',
        fontSize: 16,
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
    selectorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    selectorButton: {
        padding: 10,
        marginHorizontal: 10,
        backgroundColor: '#E6E6E6',
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: '#4B4E6D',
    },
    selectorText: {
        color: '#FFF',
        fontSize: 14,
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
