// src/api/axiosConfig.js
import axios from 'axios';

// Crea una instancia de Axios con la configuración base
const axiosInstance = axios.create({
  baseURL: 'http://10.0.2.2:3000', // Reemplaza con la URL de tu backend si es diferente
  headers: {
    'Content-Type': 'application/json',
  },
  // Puedes añadir más configuraciones aquí si es necesario
});

export default axiosInstance;
