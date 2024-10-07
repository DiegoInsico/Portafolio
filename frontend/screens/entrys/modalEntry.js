import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const ModalEntry = ({ visible, onClose, respuesta, setRespuesta }) => {
    const [media, setMedia] = useState(null);
    const [date, setDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [inputHeight, setInputHeight] = useState(20);

    const pickMedia = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Se requiere permiso para acceder a la galería.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                quality: 1,
            });
            if (!result.canceled) {
                setMedia(result.assets[0].uri);
                Alert.alert('Archivo seleccionado', '¡El archivo ha sido seleccionado con éxito!');
            } else {
                console.log('Selección cancelada');
            }
        } catch (error) {
            console.log('Error al seleccionar archivo:', error);
        }
    };

    const removeMedia = () => {
        setMedia(null);
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (selectedDate) => {
        setDate(selectedDate);
        hideDatePicker();
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan en 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={[styles.modalContainer, { marginTop: 50 }]}>
                    <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                        <View style={styles.entryTypeContainer}>
                            <Text style={styles.entryTypeText}>Tipo de entrada</Text>
                            <Pressable onPress={pickMedia}>
                                <FontAwesome name="upload" size={24} color="black" />
                            </Pressable>
                        </View>

                        {/* Imagen seleccionada */}
                        {media && (
                            <View style={styles.imageContainer}>
                                {/* Icono de basura en la parte superior izquierda */}
                                <Pressable style={styles.deleteIcon} onPress={removeMedia}>
                                    <FontAwesome name="trash" size={24} color="red" />
                                </Pressable>
                                <Image
                                    source={{ uri: media }}
                                    style={styles.image}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        <View style={styles.textInputContainer}>
                            <FontAwesome name="microphone" size={24} color="black" style={styles.microphoneIcon} />
                            <TextInput
                                style={[styles.textInput, { height: Math.max(20, inputHeight) }]} // altura mínima de 40px
                                placeholder="Cuadro de texto"
                                multiline
                                value={respuesta}
                                onChangeText={setRespuesta}
                                onContentSizeChange={(e) =>
                                    setInputHeight(e.nativeEvent.contentSize.height) // actualiza la altura según el contenido
                                }
                            />
                        </View>

                        <View style={styles.beneficiariesContainer}>
                            <Pressable style={styles.beneficiaryButton}>
                                <Text style={styles.beneficiaryText}>Beneficiario</Text>
                            </Pressable>
                            <Pressable style={styles.beneficiaryButton}>
                                <Text style={styles.beneficiaryText}>Beneficiario</Text>
                            </Pressable>
                            <Pressable style={styles.beneficiaryButton}>
                                <Text style={styles.beneficiaryText}>Beneficiario</Text>
                            </Pressable>
                        </View>

                        <View style={styles.entryTypeContainer}>
                            <Text style={styles.entryTypeText}>Fecha de envío</Text>
                            <Pressable onPress={showDatePicker}>
                                <MaterialIcons name="date-range" size={24} color="black" />
                                <Text style={styles.dateText}>{formatDate(date)}</Text>
                                <Text style={styles.dateSubtext}>Días del mes</Text>
                            </Pressable>
                        </View>

                        {/* Modal de selección de fecha */}
                        <DateTimePickerModal
                            isVisible={isDatePickerVisible}
                            mode="date"
                            onConfirm={handleConfirm}
                            onCancel={hideDatePicker}
                        />

                        <Pressable style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ModalEntry;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    scrollContentContainer: {
        flexGrow: 1,
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        paddingBottom: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    imageContainer: {
        position: 'relative', // Necesario para posicionar el ícono de basura
        width: '100%',
        height: 350,
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        position: 'absolute',
        zIndex: 3,
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semitransparente para que el ícono resalte
        padding: 5,
        borderRadius: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    entryTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
        marginBottom: 20,
    },
    entryTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Alinear el icono en la parte superior del input
        backgroundColor: '#F9C2C2',
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    microphoneIcon: {
        marginRight: 10,
        marginTop: 10, // Alinear con el texto cuando el input crece
    },
    textInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    beneficiariesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    beneficiaryButton: {
        backgroundColor: '#F0C89E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    beneficiaryText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    dateSubtext: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
    },
    closeButton: {
        backgroundColor: '#C19A6B',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 20,
        alignSelf: 'center', // Centrar el botón
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
