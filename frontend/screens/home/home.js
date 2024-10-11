import React, { useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import EntryListScreen from './listEntry'; // Asegúrate de que la ruta sea correcta
import Navbar from '../../components/Header'
import ModalEntry from '../entrys/modalEntry';
import Background from '../../components/background';

const entries = [
    {
        id: '1',
        content: {
            image: require('../../assets/test/cerro.jpg'), // Asegúrate de que la imagen exista
            text: 'Mi primer viaje a las montañas',
            video: null,
            audio: null,
        },
        date: '2024-09-30',
    },
    {
        id: '2',
        content: {
            image: require('../../assets/test/monumento.jpg'),
            text: 'Me gustaria visitar este lugar otra vez',
            video: null,
            audio: null,
        },
        date: '2024-10-01',
    },
    {
        id: '3',
        content: {
            image: require('../../assets/test/pareja.jpg'),
            text: 'Mis dias son mejor estando a su lado',
            video: null, // Video de prueba
            audio: null,
        },
        date: '2024-10-02',
    },
    {
        id: '4',
        content: {
            image: require('../../assets/test/aa.jpg'), // Asegúrate de que la imagen exista
            text: null,
            video: null,
            audio: null,
        },
        date: '2024-09-30',
    },
    {
        id: '5',
        content: {
            image: null,
            text: 'Estos dias se siente un vacio',
            video: null,
            audio: null,
        },
        date: '2024-10-01',
    },
    {
        id: '6',
        content: {
            image: require('../../assets/test/playa.jpg'),
            text: 'Recuerdos de mi último día en la playa.',
            video: null, // Video de prueba
            audio: null,
        },
        date: '2024-10-02',
    },
    {
        id: '7',
        content: {
            image: null, // Asegúrate de que la imagen exista
            text: 'Me gustaria simplemente sentir tranquilidad',
            video: null,
            audio: null,
        },
        date: '2024-09-30',
    },
    {
        id: '8',
        content: {
            image: require('../../assets/test/playa2.jpg'),
            text: 'Este es un día sin fotos o videos, pero con mucho que contar.',
            video: null,
            audio: null,
        },
        date: '2024-10-01',
    },
    {
        id: '9',
        content: {
            image: null,
            text: 'Recuerdos de mi último día en la ciudad.',
            video: 'https://www.example.com/sample-video.mp4', // Video de prueba
            audio: null,
        },
        date: '2024-10-02',
    },
    {
        id: '10',
        content: {
            image: null, // Asegúrate de que la imagen exista
            text: 'Mi primer viaje a las montañas',
            video: null,
            audio: null,
        },
        date: '2024-09-30',
    },
    {
        id: '11',
        content: {
            image: null,
            text: 'Este es un día sin fotos o videos, pero con mucho que contar.',
            video: null,
            audio: null,
        },
        date: '2024-10-01',
    },
    {
        id: '12',
        content: {
            image: null,
            text: 'Recuerdos de mi último día en la ciudad.',
            video: 'https://www.example.com/sample-video.mp4', // Video de prueba
            audio: null,
        },
        date: '2024-10-02',
    },
    {
        id: '13',
        content: {
            image: null, // Asegúrate de que la imagen exista
            text: 'Mi primer viaje a las montañas',
            video: null,
            audio: null,
        },
        date: '2024-09-30',
    },
    {
        id: '14',
        content: {
            image: null,
            text: 'Este es un día sin fotos o videos, pero con mucho que contar.',
            video: null,
            audio: null,
        },
        date: '2024-10-01',
    },
    {
        id: '15',
        content: {
            image: null,
            text: 'Recuerdos de mi último día en la ciudad.',
            video: 'https://www.example.com/sample-video.mp4', // Video de prueba
            audio: null,
        },
        date: '2024-10-02',
    },
    // ... el resto de las entradas ...
];

export default function Home({ navigation }) {
    const [modalVisible, setModalVisible] = useState(false);
    const handlePress = () => {
        setModalVisible(true); // Abrir el modal
    };

    const handleCloseModal = () => {
        setModalVisible(false); // Cerrar el modal
    };
    return (
        <Background>
            <Navbar />
            <View style={styles.dailyContainer}>
                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>¿Cuál fue tu viaje más importante?</Text>
                </View>
                <View>
                    <Pressable style={styles.addButton} onPress={handlePress}>
                        <FontAwesome name="plus" size={40} color="white" />
                    </Pressable>
                </View>
                <ModalEntry
                    visible={modalVisible}
                    onClose={handleCloseModal}
                />

                <View style={styles.entryListContainer}>
                    <EntryListScreen entries={entries} />
                </View>
            </View>
        </Background>

    );
};

Home.propTypes = {
    navigation: PropTypes.object.isRequired,
};


const styles = StyleSheet.create({
    dailyContainer: {
        paddingTop: 40,
        flex: 1,
        alignItems: 'center',
        paddingBottom: 10,
    },
    questionContainer: {
        backgroundColor: '#C19A6B',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderRadius: 30,
        marginBottom: 10,
    },
    questionText: {
        fontSize: 12,
        color: 'black',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    entryListContainer: {
        flexGrow: 1,
        width: '100%',
        paddingHorizontal: 0,
    },
});