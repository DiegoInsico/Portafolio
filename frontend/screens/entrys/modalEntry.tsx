import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Importamos ImagePicker para seleccionar imágenes y videos
import DateTimePicker from '@react-native-community/datetimepicker';

interface EntryProps {
    visible: boolean;
    onClose: () => void;
    respuesta: string;
    setRespuesta: (text: string) => void;
}

const ModalEntry: React.FC<EntryProps> = ({ visible, onClose, respuesta, setRespuesta }) => {
    const [media, setMedia] = useState<string | null>(null); // Para almacenar la URI del archivo seleccionado
    const [date, setDate] = useState(new Date()); // Estado para la fecha seleccionada
    const [showDatePicker, setShowDatePicker] = useState(false);

    const pickMedia = async () => {

        try {
            // Pedimos permiso para acceder a la galería
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Se requiere permiso para acceder a la galería.');
                return;
            }


            // Abrimos la galería para seleccionar imágenes o videos
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All, // Permitir tanto imágenes como videos
                allowsEditing: true, // Permitir editar la imagen/video
                quality: 1, // Calidad del archivo (0 a 1)
            });

            if (!result.canceled) {
                setMedia(result.assets[0].uri); // Almacenar la URI del archivo seleccionado
                Alert.alert('Archivo seleccionado', '¡El archivo ha sido seleccionado con éxito!');
            } else {
                console.log('Selección cancelada');
            }
        } catch (error) {
            console.log('Error al seleccionar archivo:', error);
        }
    };
    const onShowDatePicker = () => {
        setShowDatePicker(true);
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false); // Siempre ocultamos el picker después de seleccionar la fecha
        if (selectedDate) {
            setDate(selectedDate); // Actualizar la fecha seleccionada si existe
        }
    };

    const formatDate = (date: Date) => {
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
            onRequestClose={onClose} // Para cerrar el modal con el botón de retroceso en Android
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <ScrollView>
                        {/* Tipo de entrada */}
                        <View style={styles.entryTypeContainer}>
                            <Text style={styles.entryTypeText}>Tipo de entrada</Text>
                            <Pressable onPress={pickMedia}>
                                <FontAwesome name="upload" size={24} color="black" />
                                {media && <Text>{media}</Text>}
                            </Pressable>
                        </View>

                        {/* Si hay una imagen o video seleccionado, lo mostramos */}
                        {media && (
                            <Image
                                source={{ uri: media }}
                                style={{ width: 200, height: 200, marginBottom: 20 }}
                            />
                        )}

                        {/* Cuadro de texto con ícono de micrófono */}
                        <View style={styles.textInputContainer}>
                            <FontAwesome name="microphone" size={24} color="black" style={styles.microphoneIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Cuadro de texto"
                                multiline
                                value={respuesta}
                                onChangeText={setRespuesta}
                            />
                            <Pressable style={styles.addButton}>
                                <FontAwesome name="plus" size={24} color="white" />
                            </Pressable>
                        </View>

                        {/* Beneficiarios */}
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

                        {/* Fecha de entrega */}
                        <Pressable onPress={onShowDatePicker} style={styles.dateContainer}>
                            <MaterialIcons name="date-range" size={24} color="black" />
                            <Text style={styles.dateText}>{formatDate(date)}</Text> {/* Mostrar la fecha formateada */}
                            <Text style={styles.dateSubtext}>Días del mes</Text>
                        </Pressable>

                        {/* Mostrar el DateTimePicker si es necesario */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}

                        {/* Botón para cerrar el modal */}
                        <Pressable
                            style={styles.closeButton}
                            onPress={onClose} // Cerrar el modal
                        >
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
    entryTypeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    entryTypeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9C2C2', // Color de fondo del input
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    microphoneIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    addButton: {
        backgroundColor: '#C19A6B',
        padding: 10,
        borderRadius: 50,
        marginLeft: 10,
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
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
