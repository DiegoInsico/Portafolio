import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Image,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

/**
 * ModalEntry Component
 * 
 * Este componente representa un modal que actúa como un formulario para enviar datos.
 * Incluye campos para texto, selección de opciones, carga de imágenes y videos, selección de fecha y
 * manejo de beneficiarios.
 */
const ModalEntry = ({ visible, onClose, respuesta, setRespuesta }) => {

    //Almacenar la URI de la imagen y video seleccionada
    const [media, setMedia] = useState(null);

    //Categorias
    //Visibilidad de las opciones de categoría
    const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
    //Almacenar las opciones seleccionadas
    const [selectedOptions, setSelectedOptions] = useState([]);

    //Fecha asignada
    //Almacenar la fecha seleccionada
    const [date, setDate] = useState(new Date());
    //Visibilidad del selector de fecha
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    //Manejar la altura dinámica del TextInput
    const [inputHeight, setInputHeight] = useState(20);

    //Almacenar la lista de beneficiarios
    const [beneficiarios, setBeneficiarios] = useState(['']); // Inicia con un input vacío

    // ===========================
    // ======== FUNCIONES ========
    // ===========================


    // Funciones de Categorias
    //Función para alternar la visibilidad de las opciones de categoría
    const toggleOptions = () => {
        setIsCategoriesVisible(!isCategoriesVisible);
    };
    //Función para manejar la selección de opciones de categoría
    const handleSelectOption = (option) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter((item) => item !== option));
        } else {
            if (selectedOptions.length < 3) {
                setSelectedOptions([...selectedOptions, option]);
            } else {
                const updatedOptions = [...selectedOptions.slice(1), option];
                setSelectedOptions(updatedOptions);
            }
        }
    };
    //Determinar si se deben mostrar los campos de beneficiarios y fecha
    const showBeneficiariosFecha = selectedOptions.some(option =>
        ['Mensaje', 'Consejo', 'Recuerdo'].includes(option)
    );

    //Funciones de Media
    //Función para seleccionar una imagen o video de la galería
    const pickMedia = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se requiere permiso para acceder a la galería.');
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
            Alert.alert('Error', 'Ocurrió un error al seleccionar el archivo.');
        }
    };
    //Función para remover la imagen seleccionada
    const removeMedia = () => {
        setMedia(null);
    };

    //Funciones de Fecha
    //Funciones para manejar el selector de fecha
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
    //Función para formatear la fecha seleccionada
    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    //Funciones de Beneficiarios
    //Función para agregar un nuevo beneficiario
    const addBeneficiario = () => {
        if (beneficiarios.length < 5) {
            setBeneficiarios([...beneficiarios, '']); // Añade un nuevo campo vacío
        }
    };
    //Función para manejar el cambio en el campo de beneficiario
    const handleBeneficiarioChange = (text, index) => {
        const newBeneficiarios = [...beneficiarios];
        newBeneficiarios[index] = text;
        setBeneficiarios(newBeneficiarios);
    };

    //Funciones de Formulario
    //Función para resetear el formulario a su estado inicial
    const resetForm = () => {
        setRespuesta('');
        setMedia(null);
        setDate(new Date());
        setIsCategoriesVisible(false);
        setSelectedOptions([]);
        setBeneficiarios(['']);
        setInputHeight(20);
    };
    //Función para manejar el envío del formulario
    const handleSubmit = async () => {
        // =======================
        // ===== VALIDACIONES =====
        // =======================
        // Validaciones de beneficiarios si se muestran
        if (showBeneficiariosFecha) {
            for (let i = 0; i < beneficiarios.length; i++) {
                if (!beneficiarios[i].trim()) {
                    Alert.alert('Error', `Por favor, completa el beneficiario #${i + 1}.`);
                    return;
                }
            }
        }

        // =======================
        // ===== PREPARAR DATOS ===
        // =======================
        const formData = new FormData();
        formData.append('respuesta', respuesta);
        formData.append('date', date.toISOString());
        formData.append('selectedOptions', JSON.stringify(selectedOptions));
        formData.append('beneficiarios', JSON.stringify(beneficiarios));
        // Validaciones y preparación de la imagen
        if (media) {
            const filename = media.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('media', {
                uri: media,
                name: filename,
                type,
            });
        }

        // =======================
        // ===== ENVIAR DATOS =====
        // =======================
        try {
            const response = await fetch('https://tu-servidor.com/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                // Resetear el formulario y cerrar el modal
                resetForm();
                onClose();
            } else {
                const error = await response.text();
                Alert.alert('Error', `Error al enviar el formulario: ${error}`);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            Alert.alert('Error', 'Ocurrió un error al enviar el formulario. Por favor, intenta nuevamente.');
        }
    };

    // ===========================
    // ======== RENDERIZADO ======
    // ===========================
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>

                    <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                        {/* ===========================================
                           Sección de Tipo de Entrada y Carga de Media
                           =========================================== */}
                        <View style={styles.entryTypeContainer}>
                            {/* Botón para mostrar/ocultar opciones de categoría */}
                            <Pressable style={styles.toggleButton} onPress={toggleOptions}>
                                <Text style={styles.toggleButtonText}>Tipo de entrada</Text>
                                <FontAwesome
                                    name={isCategoriesVisible ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color="black"
                                />
                            </Pressable>
                            {/* Botón para cargar media */}
                            <Pressable onPress={pickMedia}>
                                <FontAwesome name="upload" size={24} color="black" />
                            </Pressable>
                        </View>

                        {/* ===========================================
                           Sección de Opciones de Categoría
                           =========================================== */}
                        {isCategoriesVisible && (
                            <View style={styles.optionsContainer}>
                                {/* Opción: Mensaje */}
                                <Pressable
                                    style={[
                                        styles.optionButton,
                                        selectedOptions.includes('Mensaje') && styles.selectedOptions,
                                    ]}
                                    onPress={() => handleSelectOption('Mensaje')}
                                    name='categoria'
                                >
                                    <Text style={styles.optionText}>Mensaje</Text>
                                </Pressable>

                                {/* Opción: Consejo */}
                                <Pressable
                                    style={[
                                        styles.optionButton,
                                        selectedOptions.includes('Consejo') && styles.selectedOptions,
                                    ]}
                                    onPress={() => handleSelectOption('Consejo')}
                                >
                                    <Text style={styles.optionText}>Consejo</Text>
                                </Pressable>

                                {/* Opción: Recuerdo */}
                                <Pressable
                                    style={[
                                        styles.optionButton,
                                        selectedOptions.includes('Recuerdo') && styles.selectedOptions,
                                    ]}
                                    onPress={() => handleSelectOption('Recuerdo')}
                                >
                                    <Text style={styles.optionText}>Recuerdo</Text>
                                </Pressable>

                                {/* Opción: Reflexión */}
                                <Pressable
                                    style={[
                                        styles.optionButton,
                                        selectedOptions.includes('Reflexión') && styles.selectedOptions,
                                    ]}
                                    onPress={() => handleSelectOption('Reflexión')}
                                >
                                    <Text style={styles.optionText}>Reflexión</Text>
                                </Pressable>

                                {/* Botón para agregar más opciones (si es necesario) */}
                                <Pressable style={styles.addButton}>
                                    <FontAwesome name="plus" size={24} color="black" />
                                </Pressable>
                            </View>
                        )}

                        {/* ===========================================
                           Sección de Imagen Seleccionada
                           =========================================== */}
                        {media && (
                            <View style={styles.imageContainer}>
                                {/* Botón para eliminar la imagen */}
                                <Pressable style={styles.deleteIcon} onPress={removeMedia}>
                                    <FontAwesome name="trash" size={24} color="red" />
                                </Pressable>
                                {/* Mostrar la imagen seleccionada */}
                                <Image source={{ uri: media }} style={styles.image} resizeMode="contain" 
                                name='media'/>
                            </View>
                        )}

                        {/* ===========================================
                           Campo de Texto Multilinea
                           =========================================== */}
                        <View style={styles.textInputContainer}>
                            <FontAwesome
                                name="microphone"
                                size={24}
                                color="black"
                                style={styles.microphoneIcon}
                            />
                            <TextInput
                                style={[styles.textInput, { height: Math.max(20, inputHeight) }]}
                                placeholder="Cuadro de texto"
                                multiline
                                name='descripcion'
                                value={respuesta}
                                onChangeText={setRespuesta}
                                onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
                            />
                        </View>

                        {/* ===========================================
                           Sección de Beneficiarios y Fecha de Envío
                           =========================================== */}
                        {showBeneficiariosFecha && (
                            <>
                                {/* Lista de Beneficiarios */}
                                <View style={styles.beneficiariesContainer}>
                                    {beneficiarios.map((beneficiario, index) => (
                                        <View key={index} style={styles.beneficiarioRow}>
                                            <TextInput
                                                style={styles.beneficiaryInput}
                                                value={beneficiario}
                                                maxLength={50}
                                                name='beneficiario'
                                                onChangeText={(text) => handleBeneficiarioChange(text, index)}
                                                placeholder="Beneficiario"
                                            />
                                            {/* Botón para agregar un nuevo beneficiario */}
                                            {beneficiarios.length < 5 && index === beneficiarios.length - 1 && (
                                                <Pressable
                                                    style={styles.addBeneficiaryButton}
                                                    onPress={addBeneficiario}
                                                >
                                                    <FontAwesome name="plus" size={16} color="black" />
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
                                </View>

                                {/* ===========================================
                                   Selector de Fecha de Envío
                                   =========================================== */}
                                <View style={styles.entryTypeContainer}>
                                    <Text style={styles.entryTypeText}>Fecha de envío</Text>
                                    <Pressable
                                        onPress={showDatePicker}
                                        style={{ flexDirection: 'row', alignItems: 'center' }}
                                        name='fecha_entrega'
                                    >
                                        <MaterialIcons name="date-range" size={24} color="black" />
                                        <Text style={styles.dateText}>{formatDate(date)}</Text>
                                        <Text style={styles.dateSubtext}>Días del mes</Text>
                                    </Pressable>
                                </View>

                                {/* ===========================================
                                   Componente de Selector de Fecha
                                   =========================================== */}
                                <DateTimePickerModal
                                    isVisible={isDatePickerVisible}
                                    mode="date"
                                    onConfirm={handleConfirm}
                                    onCancel={hideDatePicker}
                                />
                            </>
                        )}

                        {/* ===========================================
                           Botones de Cerrar y Enviar
                           =========================================== */}
                        <View style={styles.buttonContainer}>
                            {/* Botón para cerrar el modal */}
                            <Pressable style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeButtonText}>Cerrar</Text>
                            </Pressable>
                            {/* Botón para enviar el formulario */}
                            <Pressable style={styles.submitButton} onPress={handleSubmit}>
                                <Text style={styles.submitButtonText}>Enviar</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default ModalEntry;

const styles = StyleSheet.create({
    // ===================================
    // ===== Estilos del Fondo Modal =====
    // ===================================
    modalBackground: {
        flex: 1,
        justifyContent: 'center', // Centrar el modal verticalmente
        alignItems: 'center',     // Centrar el modal horizontalmente
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente
    },

    // ===================================
    // ===== Estilos del Contenedor =====
    // ===== Principal del Modal =========
    // ===================================
    modalContainer: {
        width: '90%',
        backgroundColor: 'white',
        paddingBottom: 15,
        borderRadius: 10,
        justifyContent: 'space-between',
        alignItems: 'stretch', // Alinear elementos hijos para que ocupen el ancho completo
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
        maxHeight: '80%', // Altura máxima del modal
    },

    // ===================================
    // ===== Estilos del ScrollView =====
    // ===================================
    scrollContentContainer: {
        padding: 20,
    },

    // ===================================
    // ===== Estilos de Tipo de Entrada ===
    // ===== y Botón de Carga de Media ====
    // ===================================
    entryTypeContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginLeft: 10,
        width: '90%',
        marginTop: 20,
        marginBottom: 20,
        alignItems: 'center', // Alinear verticalmente los elementos
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0C89E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 10,
    },
    toggleButtonText: {
        fontSize: 16,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#fff',
        borderColor: '#000',
        borderWidth: 1,
        padding: 10,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },

    // ===================================
    // ===== Estilos de Opciones ========
    // ===== de Categoría ===============
    // ===================================
    optionsContainer: {
        marginTop: 10,
        marginBottom: 20,
        width: '80%',
        flexDirection: 'row',
        flexWrap: 'wrap', // Permite que las opciones se ajusten en múltiples líneas
        justifyContent: 'space-between', // Distribuye espacio entre las opciones
    },
    optionButton: {
        backgroundColor: '#fff',
        borderColor: '#000',
        borderWidth: 1,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 15,
        margin: 5,
    },
    selectedOptions: {
        borderColor: '#C19A6B', // Cambiar el color del borde si está seleccionado
        borderWidth: 2,
    },
    optionText: {
        fontSize: 12, // Tamaño reducido del texto para las opciones
    },

    // ===================================
    // ===== Estilos de Imagen ===========
    // ===== Seleccionada =================
    // ===================================
    imageContainer: {
        position: 'relative', // Necesario para posicionar el ícono de basura
        width: '100%',
        aspectRatio: 16 / 9, // Mantiene la proporción de la imagen (puedes ajustarlo según tus necesidades)
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

    // ===================================
    // ===== Estilos del Campo de ========
    // ===== Texto Multilinea ============
    // ===================================
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Alinear el ícono en la parte superior del input
        backgroundColor: '#F9C2C2',
        width: '100%',
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

    // ===================================
    // ===== Estilos de Beneficiarios ===
    // ===================================
    beneficiariesContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: '100%', // Alinear con el contenedor principal
        marginBottom: 20,
        marginLeft: 10,
    },
    beneficiarioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    beneficiaryInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        flex: 1,
    },
    addBeneficiaryButton: {
        marginLeft: 10,
        backgroundColor: '#F0C89E',
        padding: 10,
        borderRadius: 5,
    },

    // ===================================
    // ===== Estilos de Fecha ============
    // ===================================
    dateText: {
        fontSize: 16, // Tamaño reducido para mejor alineación
        fontWeight: 'bold',
        marginLeft: 10,
    },
    dateSubtext: {
        fontSize: 12, // Tamaño reducido para mejor alineación
        color: '#666',
        marginLeft: 10,
    },

    // ===================================
    // ===== Estilos de Botones ==========
    // ===== Cerrar y Enviar ==============
    // ===================================
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
    submitButton: {
        backgroundColor: '#4CAF50', // Verde para indicar acción positiva
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
