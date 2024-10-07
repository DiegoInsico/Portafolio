// api/axiosInstance.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Reemplaza con tu dirección IP y puerto
  timeout: 10000, // Opcional: tiempo máximo en milisegundos para que una solicitud falle si no hay respuesta
});

// Agregar un interceptor para incluir el token JWT en cada solicitud
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
