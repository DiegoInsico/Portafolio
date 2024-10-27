import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { db } from '../../utils/firebase'; // Configuración de Firebase
import { doc, updateDoc } from "firebase/firestore";
import { ScrollView } from 'react-native-gesture-handler';

const SecuritySettings = () => {
    const [level2Password, setLevel2Password] = useState('');
    const [confirmLevel2Password, setConfirmLevel2Password] = useState('');
    const [level3Password, setLevel3Password] = useState('');
    const [confirmLevel3Password, setConfirmLevel3Password] = useState('');


    const handleSaveLevel2Password = async () => {
        if (level2Password !== confirmLevel2Password) {
            Alert.alert('Error', 'Las contraseñas del Nivel 2 no coinciden');
            return;
        }
    
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { level2Password: level2Password });
            Alert.alert('Éxito', 'La contraseña de Nivel 2 se ha guardado correctamente');
        } else {
            Alert.alert('Error', 'No se ha encontrado el usuario');
        }
    };
    
    const handleSaveLevel3Password = async () => {
        if (level3Password !== confirmLevel3Password) {
            Alert.alert('Error', 'Las contraseñas del Nivel 3 no coinciden');
            return;
        }
    
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { level3Password: level3Password });
            Alert.alert('Éxito', 'La contraseña de Nivel 3 se ha guardado correctamente');
        } else {
            Alert.alert('Error', 'No se ha encontrado el usuario');
        }
    };
    

    return (
        <View style={styles.container}>
            <ScrollView>
            <Text style={styles.title}>Configuración de Seguridad</Text>
            <Text style={styles.description}>
                Aquí puedes configurar contraseñas adicionales para proteger tus niveles de acceso. 
                El Nivel 2 es para contenido privado, mientras que el Nivel 3 es para contenido de alta confidencialidad.
            </Text>

            {/* Contraseña para Nivel 2 */}
            <View style={styles.section}>
                <Text style={styles.label}>Contraseña para Nivel 2:</Text>
                <TextInput
                    secureTextEntry
                    value={level2Password}
                    onChangeText={setLevel2Password}
                    style={styles.input}
                    placeholder="Ingrese contraseña"
                />
                <TextInput
                    secureTextEntry
                    value={confirmLevel2Password}
                    onChangeText={setConfirmLevel2Password}
                    style={styles.input}
                    placeholder="Confirme contraseña"
                />
                <Button title="Guardar Nivel 2" onPress={handleSaveLevel2Password} color="#FFD700" />
            </View>

            {/* Contraseña para Nivel 3 */}
            <View style={styles.section}>
                <Text style={styles.label}>Contraseña para Nivel 3:</Text>
                <TextInput
                    secureTextEntry
                    value={level3Password}
                    onChangeText={setLevel3Password}
                    style={styles.input}
                    placeholder="Ingrese contraseña"
                />
                <TextInput
                    secureTextEntry
                    value={confirmLevel3Password}
                    onChangeText={setConfirmLevel3Password}
                    style={styles.input}
                    placeholder="Confirme contraseña"
                />
                <Button title="Guardar Nivel 3" onPress={handleSaveLevel3Password} color="#FFD700" />
            </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2C3E50',
    },
    title: {
        fontSize: 24,
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: '#F0E4C2',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginVertical: 20,
        padding: 15,
        backgroundColor: '#34495E',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        color: '#FFD700',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#F4E4E4',
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        borderColor: '#C2A66B',
        borderWidth: 1,
        color: '#333',
    },
});

export default SecuritySettings;
