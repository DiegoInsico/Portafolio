import axios from './api';

export const login = async (correo, contrasena) => {
  try {
    const response = await axios.post('http://localhost:3000/auth/login', { correo, contrasena });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (correo, contrasena) => {
  try {
    const response = await axios.post('http://localhost:3000/auth/register', { correo, contrasena });
    return response.data;
  } catch (error) {
    throw error;
  }
};
