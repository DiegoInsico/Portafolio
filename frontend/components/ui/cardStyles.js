import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85; // 85% del ancho de la pantalla

const cardStyles = StyleSheet.create({
  wrapper: {
    marginVertical: 7,
    alignItems: 'center',
    position: 'relative', // Para posicionamiento absoluto de elementos como EmotionFlag
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 4,
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden', // Para recortar contenido que exceda los bordes
    padding: 15,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
  },
  content: {
    paddingTop: 5,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  emotionFlag: {
    position: 'absolute',
    top: 0.1, // Ajustado para que esté en la parte superior
    left: 50, // Posicionado desde el borde izquierdo
    zIndex: 2, // Asegura que se muestre sobre otros elementos
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semitransparente para mayor contraste
    paddingHorizontal: 8, // Espaciado interno horizontal
    paddingVertical: 4, // Espaciado interno vertical
    borderRadius: 12, // Bordes redondeados para un diseño limpio
    elevation: 6, // Añade sombra para resaltarlo visualmente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  
});

export default cardStyles;
