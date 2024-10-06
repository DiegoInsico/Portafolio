import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { ResponsiveGrid } from 'react-native-flexible-grid';

interface EntryContent {
    image?: any; // Tipo de imagen local
    video?: any; // Tipo de video local
    text?: string;
    audio?: any; // Por si luego añades audios
}

interface Entry {
    id: string;
    content: EntryContent;
    date: string;
}

interface EntryListScreenProps {
    entries: Entry[];
}

interface RenderItemProps {
    item: {
        id: string;
        media: any; // Puede ser imagen o video
        isVideo: boolean;
        text: string;
        date: string;
        heightRatio: number;
    };
}
const getRandomHeightRatio = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

// Función para calcular el ratio basado en la longitud del texto
const getTextHeightRatio = (text: string): number => {
    const length = text.length;
    if (length <= 50) return 0.7; // Texto corto, ratio bajo
    if (length <= 100) return 1; // Texto mediano, ratio estándar
    if (length <= 200) return 1.5; // Texto más largo, ratio más alto
    return 2; // Texto muy largo, ratio mayor
};

export default function EntryListScreen({ entries }: EntryListScreenProps) {
    const [data, setData] = useState<
        {
            id: string;
            media: any;
            isVideo: boolean;
            text: string;
            date: string;
            heightRatio: number;
        }[]
    >([]);

    // Generar los datos con imágenes, videos o solo texto
    const generateData = () => {
        return entries.map((entry) => ({
            id: entry.id,
            media: entry.content.image ?? entry.content.video, // Prioridad a imagen o video
            isVideo: Boolean(entry.content.video),
            text: entry.content.text ?? '', // Mostrar texto si está disponible
            date: entry.date, // Añadimos la fecha
            heightRatio: entry.content.image || entry.content.video
                ? getRandomHeightRatio(1.3, 2.3) // Si hay media, un ratio fijo
                : getTextHeightRatio(entry.content.text || ''), // Si es solo texto, calcular el ratio basado en el texto
        }));
    };

    const renderItem = ({ item }: RenderItemProps) => {
        return (
            <View
                style={[styles.boxContainer, { height: (item.heightRatio ?? 1) * 150 }]} // Ajustar la altura según el ratio
            >
                {/* Mostrar la fecha arriba sin fondo contenedor cuando hay media */}
                {item.media ? (
                    <Text style={styles.dateTextTop}>{item.date}</Text>
                ) : (
                    <Text style={styles.dateTextBottom}>{item.date}</Text>
                )}

                {item.isVideo ? (
                    item.media && (
                        <Video
                            source={typeof item.media === 'string' ? { uri: item.media } : item.media}
                            style={styles.box}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN} // Ajustamos el video al contenedor
                            isLooping
                        />
                    )
                ) : item.media ? (
                    <Image
                        source={typeof item.media === 'string' ? { uri: item.media } : item.media}
                        style={styles.box}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.textOnlyContainer}>
                        <Text style={styles.textOnly}>{item.text}</Text>
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                )}

                {/* Overlay del texto solo si hay media */}
                {item.text && item.media && (
                    <View style={styles.overlayBottom}>
                        <Text style={styles.overlayText}>{item.text}</Text>
                    </View>
                )}
            </View>
        );
    };

    useEffect(() => {
        setData(generateData());
    }, [entries]);

    return (
        <View style={{ flex: 1 }}>
            <ResponsiveGrid
                keyExtractor={(item) => item.id.toString()}
                maxItemsPerColumn={2}
                data={data}
                renderItem={renderItem}
                style={{ padding: 0 }}
                virtualization={true}  // Habilitar virtualización para un mejor rendimiento
                showScrollIndicator={true}  // Mostrar el indicador de desplazamiento si es necesario
            />
        </View>
    );
}

const styles = StyleSheet.create({
    boxContainer: {
        flex: 1,
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    box: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    textOnlyContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#C19A6B', // Fondo para cuando es solo texto
        minHeight: 150,  // Altura mínima para casos con poco texto
        flexGrow: 1,     // Permite que el contenedor crezca con el texto
        flexShrink: 1,   // Permite que el contenedor se reduzca si es necesario
        width: '100%',   // Ocupar el ancho total del contenedor
    },
    textOnly: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    dateTextTop: {
        position: 'absolute',
        top: 10, // Coloca la fecha en la parte superior para imágenes o videos
        left: 10,
        fontSize: 12,
        color: '#fff', // Blanco para contraste
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fondo translúcido para mayor legibilidad
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 5,
        zIndex: 1, // Asegura que esté sobre el contenido
    },
    dateTextBottom: {
        position: 'absolute',
        bottom: 10, // Coloca la fecha en la parte inferior centrada para texto solo
        left: 0,
        right: 0,
        fontSize: 12,
        color: '#333', // Color más oscuro para mayor contraste en el fondo de texto
        textAlign: 'center',
        backgroundColor: 'transparent', // Sin fondo en este caso
    },
    overlayBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    overlayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    dateText: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        marginTop: 5, // Separar la fecha del resto del contenido
    },
});
