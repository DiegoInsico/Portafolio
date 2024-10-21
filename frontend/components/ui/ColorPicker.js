import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

const colors = [
    '#6874e7', '#b8304f', '#758E4F', '#fa3741', '#F26419',
    '#F6AE2D', '#DFAEB4', '#7A93AC', '#33658A', '#3d2b56',
    '#42273B', '#171A21',
];

const CIRCLE_SIZE = 40;

const ColorPicker = ({ selectedColor, onColorSelect }) => {
    const sheet = React.useRef(null); // Referencia para RBSheet

    return (
        <SafeAreaView style={styles.container}>
            {/* Contenedor de color que cambiará según el color seleccionado */}
            <TouchableOpacity
                style={[styles.colorContainer, { backgroundColor: selectedColor }]}
                onPress={() => sheet.current.open()} // Abre el RBSheet al presionar
            >
                <Text style={styles.colorText}>Selecciona un Color</Text>
            </TouchableOpacity>

            {/* RBSheet para mostrar las opciones de color */}
            <RBSheet
                ref={sheet}
                height={300}
                openDuration={250}
                customStyles={{
                    container: styles.sheetContainer,
                }}
            >
                <View style={styles.sheetHeader}>
                    <Text style={styles.sheetTitle}>Elige un color</Text>
                </View>
                <View style={styles.colorsGrid}>
                    {colors.map((color, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                selectedColor === color && styles.selectedOption, // Borde para el color seleccionado
                            ]}
                            onPress={() => {
                                onColorSelect(color); // Llamar a la función del componente padre para actualizar el color
                                sheet.current.close(); // Cerrar el RBSheet al seleccionar un color
                            }}
                        />
                    ))}
                </View>
            </RBSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    colorContainer: {
        width: 300,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Sombra en Android
    },
    colorText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    sheetContainer: {
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    sheetHeader: {
        marginBottom: 10,
        alignItems: 'center',
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginVertical: 10,
    },
    colorOption: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        margin: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedOption: {
        borderColor: '#000', // Borde negro para el color seleccionado
    },
});

export default ColorPicker;
