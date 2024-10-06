// api/axiosInstance.ts

import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crea una instancia de axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000', // Asegúrate de usar la dirección IP correcta y el puerto
  timeout: 10000, // Tiempo máximo para una solicitud antes de que falle
});

// Interceptor para agregar el token JWT en cada solicitud
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error retrieving token', error);
      return config;
    }
  },
  (error) => {
    // Manejo de errores en la solicitud
    return Promise.reject(error);
  }
);

export default axiosInstance;
