import React, { useState } from 'react';
import {
    Modal, View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, Image, ImageBackground
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axiosInstance from '../../utils/axiosInstance';
import { Platform } from 'react-native';

/**
 * ModalEntry Component
 * 
 * Este componente representa un modal que actúa como un formulario para enviar datos.
 * Incluye campos para texto, selección de opciones, carga de imágenes y videos, selección de fecha y
 * manejo de beneficiarios.
 */
const ModalEntry = ({ visible, onClose }) => {

    //Almacenar la URI de la imagen y video seleccionada
    const [media, setMedia] = useState(null);
    const [respuesta, setRespuesta] = useState('');

    //Categorias
    //Visibilidad de las opciones de categoría
    const [isCategoriesVisible, setIsCategoriesVisible] = useState(false);
    const tiposDeEntrada = ['Mensaje', 'Consejo', 'Recuerdo', 'Reflexión'];
    //Almacenar las opciones seleccionadas
    const [selectedOption, setSelectedOption] = useState('');

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
        setSelectedOption(option); // Establecer el valor de la opción seleccionada
    };
    //Determinar si se deben mostrar los campos de beneficiarios y fecha
    const showBeneficiariosFecha = ['Mensaje', 'Consejo', 'Recuerdo', 'Reflexion'].includes(selectedOption);

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
                base64: false, // Asegura que no se retorne base64
            });
            console.log('Resultado de ImagePicker:', result);
            if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
                setMedia(result.assets[0].uri);
                Alert.alert('Archivo seleccionado', '¡El archivo ha sido seleccionado con éxito!');
            } else {
                console.log('Selección cancelada o URI no válida');
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
    const handleRemoveBeneficiary = (index) => {
        const updatedBeneficiarios = [...beneficiarios];
        updatedBeneficiarios.splice(index, 1); // Elimina el beneficiario en el índice dado
        setBeneficiarios(updatedBeneficiarios); // Actualiza el estado con la lista modificada
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
        setSelectedOption('');
        setBeneficiarios(['']);
        setInputHeight(20);
    };
    const getMimeType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'mp4':
                return 'video/mp4';
            case 'mov':
                return 'video/quicktime';
            // Añade más tipos según tus necesidades
            default:
                return 'application/octet-stream';
        }
    };
    //Función para manejar el envío del formulario
    const handleSubmit = async () => {
        // Validaciones previas...

        const formData = new FormData();
        formData.append('category', selectedOption);
        formData.append('message', respuesta);
        formData.append('date', date.toISOString());

        // Adjuntar la imagen/video si está presente
        if (media) {
            const filename = media.split('/').pop();
            const mimeType = getMimeType(filename);

            // Asegurarse de que `media` es una cadena válida antes de llamar a `.replace`
            const uri = Platform.OS === 'android' ? media : media.replace('file://', '');

            formData.append('media', {
                uri,
                name: filename,
                type: mimeType,
            });
        }

        // **No** agregar 'media_url' al FormData
        // Elimina cualquier línea que haga `formData.append('media_url', ...)`


        // Enviar los datos al backend
        try {
            const response = await axiosInstance.post("/entries/submit", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201 || response.status === 200) {
                resetForm();
                onClose();
                Alert.alert('Éxito', 'La entrada se ha enviado correctamente.');
            } else {
                const error = response.data?.message || 'Error desconocido.';
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
                <ImageBackground
                    source={require('../../assets/test/fondo.jpeg')} // Ruta a tu imagen
                    style={styles.backgroundImage}
                />
                <View style={styles.modalContainer}>

                    <ScrollView contentContainerStyle={styles.scrollContentContainer}>
                        {/* ===========================================
                           Sección de Tipo de Entrada y Carga de Media
                           =========================================== */}
                        <View style={styles.entryTypeContainer}>
                            {/* Botón para mostrar/ocultar opciones de categoría */}
                            <Pressable style={styles.closeButton} onPress={onClose}>
                                {/* Icono de flecha hacia atrás */}
                                <FontAwesome name="arrow-left" size={24} color="white" />
                            </Pressable>
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
                                <FontAwesome name="upload" size={24} color="white" style={styles.uploadButton} />
                            </Pressable>
                        </View>

                        {/* ===========================================
                           Sección de Opciones de Categoría
                           =========================================== */}
                        {isCategoriesVisible && (
                            <View style={styles.optionsContainer}>
                                {tiposDeEntrada.map((tipo, index) => (
                                    <Pressable
                                        key={index}
                                        style={[
                                            styles.optionButton,
                                            selectedOption === tipo && styles.selectedOption, // Aplicar estilo si está seleccionado
                                        ]}
                                        name='category'
                                        onPress={() => handleSelectOption(tipo)}
                                    >
                                        <Text style={styles.optionText}>{tipo}</Text>

                                        {/* Mostrar la hoja si está seleccionado */}
                                        {selectedOption === tipo && (
                                            <Image
                                                source={require('../../assets/test/hoja.png')} // Ruta a la hoja de otoño
                                                style={styles.leafIcon}
                                            />
                                        )}
                                    </Pressable>
                                ))}
                            </View>
                        )}

                        {/* ===========================================
                           Sección de Imagen Seleccionada
                           =========================================== */}
                        {media && (
                            <View style={styles.imageContainer}>
                                {/* Botón para eliminar la imagen */}
                                <Pressable style={styles.deleteIcon} onPress={removeMedia}>
                                    <FontAwesome name="trash" size={30} color="red" />
                                </Pressable>
                                {/* Mostrar la imagen seleccionada */}
                                <Image source={{ uri: media }} style={styles.image} resizeMode="contain"
                                    name='media' />
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
                                name='message'
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
                                                name="beneficiario"
                                                onChangeText={(text) => handleBeneficiarioChange(text, index)}
                                                placeholder="Beneficiario"
                                            />

                                            {/* Si solo hay 1 beneficiario, mostramos el botón agregar */}
                                            {beneficiarios.length === 1 && (
                                                <Pressable
                                                    style={styles.addBeneficiaryButton}
                                                    onPress={addBeneficiario}
                                                >
                                                    <FontAwesome name="plus" size={16} color="black" />
                                                </Pressable>
                                            )}

                                            {/* Si hay más de 1 beneficiario, muestra el botón de eliminar excepto en el último */}
                                            {beneficiarios.length > 1 && index < beneficiarios.length - 1 && (
                                                <Pressable
                                                    style={styles.removeBeneficiaryButton}
                                                    onPress={() => handleRemoveBeneficiary(index)}
                                                >
                                                    <FontAwesome name="times" size={16} color="white" />
                                                </Pressable>
                                            )}

                                            {/* El último beneficiario tiene el botón agregar si hay menos de 5 beneficiarios */}
                                            {beneficiarios.length > 1 && index === beneficiarios.length - 1 && beneficiarios.length < 5 && (
                                                <Pressable
                                                    style={styles.addBeneficiaryButton}
                                                    onPress={addBeneficiario}
                                                >
                                                    <FontAwesome name="plus" size={16} color="black" />
                                                </Pressable>
                                            )}

                                            {/* Si hay 5 beneficiarios, muestra solo el botón de eliminar en todos */}
                                            {beneficiarios.length === 5 && (
                                                <Pressable
                                                    style={styles.removeBeneficiaryButton}
                                                    onPress={() => handleRemoveBeneficiary(index)}
                                                >
                                                    <FontAwesome name="times" size={16} color="white" />
                                                </Pressable>
                                            )}
                                        </View>
                                    ))}
                                </View>

                                {/* ===========================================
                                   Selector de Fecha de Envío
                                   =========================================== */}
                                <View style={styles.entryTypeContainer2}>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundImage: {
        width: '100%', // Cubre toda la pantalla
        height: '100%', // Cubre toda la pantalla
        justifyContent: 'center', // Centrar los elementos del modal
    },

    // ===================================
    // ===== Estilos del Contenedor =====
    // ===== Principal del Modal =========
    // ===================================
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
        width: '90%', // Ajustar para dejar espacio entre los elementos
        alignItems: 'center', // Alineación vertical central
        alignSelf: 'center', // Centra el contenedor en la pantalla
        marginBottom: 20,
    },
    toggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0C89E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginLeft: 10, // Alinearlo bien con la flecha
    },
    closeButton: {
        backgroundColor: '#C19A6B',
        padding: 10, // Reducir padding para que el botón no sea demasiado grande
        borderRadius: 50, // Redondeado para que parezca un círculo
    },
    uploadButton: {
        backgroundColor: '#C19A6B', // Añadir el mismo fondo que el closeButton para consistencia
        padding: 10, // Similar al closeButton
        borderRadius: 50,
    },
    toggleButtonText: {
        fontSize: 16,
        marginRight: 10,
    },

    // ===================================
    // ===== Estilos de Opciones ========
    // ===== de Categoría ===============
    // ===================================
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Permitir que los botones se ajusten a múltiples líneas
        justifyContent: 'space-around', // Asegurar que haya espacio entre los botones
        marginBottom: 20,
    },

    optionButton: {
        backgroundColor: '#F0C89E', // Color de fondo
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginBottom: 15, // Separar verticalmente
        marginHorizontal: 10, // Separar horizontalmente
        flexDirection: 'row', // Para alinear el ícono de la hoja dentro del botón
        alignItems: 'center', // Centrar verticalmente el ícono y el texto
    },

    selectedOption: {
        backgroundColor: '#C19A6B', // Color para el botón seleccionado
    },

    optionText: {
        fontSize: 16,
        color: '#000', // Color del texto
        marginRight: 10, // Añadir margen para que la hoja no se superponga
    },

    leafIcon: {
        width: 40, // Tamaño del ícono de hoja
        height: 40,
        position: 'absolute',
        right: -10
        , // Posicionar la hoja a la derecha dentro del botón
        top: '50%',
        transform: [{ translateY: -13 }], // Centrar verticalmente la hoja dentro del botón
    },
    // ===================================
    // ===== Estilos de Imagen ===========
    // ===== Seleccionada =================
    // ===================================
    imageContainer: {
        position: 'relative', // Necesario para posicionar el ícono de basura
        width: '100%',
        aspectRatio: 1, // Mantiene la proporción de la imagen (puedes ajustarlo según tus necesidades)
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20, // Añadimos un borde redondeado más grande al contenedor
        overflow: 'hidden',
    },
    deleteIcon: {
        position: 'absolute',
        zIndex: 3,
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente para que el ícono resalte
        padding: 10,
        borderRadius: 20,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },

    // ===================================
    // ===== Estilos del Campo de ========
    // ===== Texto Multilinea ============
    // ===================================
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Alinear el ícono en la parte superior del input
        backgroundColor: '#F0C89E',
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
        paddingHorizontal: 10, // Aseguramos un padding lateral consistente
    },

    beneficiarioRow: {
        flexDirection: 'row',
        alignItems: 'center', // Alinear verticalmente el input y el botón
        justifyContent: 'space-between', // Asegura que el input y el botón estén bien distribuidos
        marginBottom: 15, // Reducimos el margen inferior para acercar más los elementos
        width: '100%',
    },

    beneficiaryInput: {
        borderColor: '#ccc',
        backgroundColor: '#F0C89E',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        flex: 1, // Dejar que el campo de texto ocupe el espacio disponible
        marginRight: 10, // Añadir margen derecho para que el input no quede pegado al botón
    },

    removeBeneficiaryButton: {
        backgroundColor: '#FF6347', // Color rojo para indicar eliminación
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 45,
        height: 45,
    },

    addBeneficiaryButton: {
        backgroundColor: '#C19A6B',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: 45,
        height: 45,
    },

    // ===================================
    // ===== Estilos de Fecha ============
    // ===================================
    entryTypeContainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Espaciado adecuado entre los elementos
        backgroundColor: '#F0C89E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '100%', // Asegura que ocupe el 100% del contenedor
        alignSelf: 'center',
        marginBottom: 20,
    },

    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000',
    },

    dateSubtext: {
        fontSize: 12,
        color: '#666',
        marginLeft: 10,
    },

    // ===================================
    // ===== Estilos de Botones ==========
    // ===== Cerrar y Enviar ==============
    // ===================================
    buttonContainer: {
        alignItems: 'center',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#3B873E', // Verde para indicar acción positiva
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
