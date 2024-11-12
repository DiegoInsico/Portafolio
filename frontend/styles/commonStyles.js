// commonStyles.js

import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1E1E1E', // Fondo oscuro
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#FFD700', // Color dorado
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFD700',
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },
  buttonText: {
    color: '#1E1E1E',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
