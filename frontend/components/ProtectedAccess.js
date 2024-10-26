import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const ProtectedAccess = ({ onAccessGranted, nivel, onClose }) => {
    const [inputPassword, setInputPassword] = useState('');
    const [biometricSupported, setBiometricSupported] = useState(false);
    const [levelPassword, setLevelPassword] = useState('');

    useEffect(() => {
        const fetchPassword = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setLevelPassword(nivel === '2' ? data.level2Password : data.level3Password);
                    } else {
                        Alert.alert('Error', 'No se ha encontrado la configuración de seguridad.');
                    }
                }
            } catch (error) {
                console.error("Error al obtener la contraseña:", error);
                Alert.alert('Error', 'No se pudo obtener la configuración de seguridad.');
            }
        };

        const checkBiometricSupport = async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const biometrics = await LocalAuthentication.supportedAuthenticationTypesAsync();
            setBiometricSupported(
                compatible && biometrics.includes(
                    nivel === '2' 
                        ? LocalAuthentication.AuthenticationType.FINGERPRINT 
                        : LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
                )
            );

            if (biometricSupported) {
                handleBiometricAuth();
            }
        };

        fetchPassword();
        checkBiometricSupport();
    }, [nivel]);

    const handleBiometricAuth = async () => {
        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: nivel === '2' ? 'Usa tu huella para acceder' : 'Usa reconocimiento facial para acceder',
            cancelLabel: 'Usar contraseña',
            disableDeviceFallback: true,
        });

        if (result.success) {
            onAccessGranted();
        } else {
            Alert.alert('Autenticación fallida', 'Inténtalo nuevamente o usa tu contraseña');
        }
    };

    const handleCheckPassword = () => {
        if (inputPassword === levelPassword) {
            onAccessGranted();
        } else {
            Alert.alert('Contraseña incorrecta');
        }
    };

    return (
        <View style={styles.modalContainer}>
            <Text style={styles.titleText}>
                {nivel === '2' 
                    ? 'Confesiones del Corazón' 
                    : 'Esencia Profunda'}
            </Text>
            <Text style={styles.promptText}>
                {nivel === '2' 
                    ? 'Autentícate con tu huella o ingresa tu contraseña para acceder.' 
                    : 'Autentícate con reconocimiento facial o ingresa tu contraseña.'}
            </Text>
            <TextInput
                secureTextEntry
                style={styles.input}
                value={inputPassword}
                onChangeText={setInputPassword}
                placeholder="Contraseña"
                placeholderTextColor="#C2A66B"
            />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.verifyButton} onPress={handleCheckPassword}>
                    <Text style={styles.buttonText}>Verificar</Text>
                </TouchableOpacity>
                {biometricSupported && (
                    <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                        <Text style={styles.buttonText}>Usar Biometría</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2C3E50', // Fondo sólido oscuro
        padding: 25,
        borderRadius: 15,
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
        textAlign: 'center',
    },
    promptText: {
        fontSize: 16,
        marginBottom: 20,
        color: '#F0E4C2',
        textAlign: 'center',
    },
    input: {
        width: '90%',
        padding: 12,
        backgroundColor: '#F4E4E4',
        borderRadius: 8,
        marginBottom: 20,
        borderColor: '#C2A66B',
        borderWidth: 1,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    verifyButton: {
        backgroundColor: '#C2A66B',
        padding: 12,
        borderRadius: 8,
        width: '30%',
        alignItems: 'center',
    },
    biometricButton: {
        backgroundColor: '#4B4E6D',
        padding: 12,
        borderRadius: 8,
        width: '30%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#888',
        padding: 12,
        borderRadius: 8,
        width: '30%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#F0E4C2',
        fontWeight: '600',
        fontSize: 15,
    },
});

export default ProtectedAccess;
