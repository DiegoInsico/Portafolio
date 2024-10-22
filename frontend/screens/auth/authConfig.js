// authConfig.js
export const authConfig = {
    clientID: '04efd50e959a4f32ba907b285bfbe38d', // Reemplaza con tu Client ID
    redirectURL: 'soy://callback', // Reemplaza con tu Redirect URI
    tokenSwapURL: '', // Opcional, si no usas intercambio de tokens
    tokenRefreshURL: '', // Opcional, si no usas refresco de tokens
    scopes: [
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
    ],
};
