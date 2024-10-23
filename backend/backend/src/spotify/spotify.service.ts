// spotify.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpotifyService {
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
    }

    // Método para intercambiar el código por tokens
    async exchangeCodeForTokens(code: string): Promise<any> {
        const tokenUrl = 'https://accounts.spotify.com/api/token';
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', this.configService.get<string>('SPOTIFY_REDIRECT_URI'));

        try {
            const response = await firstValueFrom(
                this.httpService.post(tokenUrl, params.toString(), {
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );
            return response.data; // Contiene access_token y refresh_token
        } catch (error) {
            console.error('Error exchanging code for tokens:', error.response?.data || error.message);
            throw new HttpException('Error exchanging code for tokens', HttpStatus.BAD_REQUEST);
        }
    }

    // Método para refrescar el token de acceso
    async refreshAccessToken(refreshToken: string): Promise<any> {
        const tokenUrl = 'https://accounts.spotify.com/api/token';
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        try {
            const response = await firstValueFrom(
                this.httpService.post(tokenUrl, params.toString(), {
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );
            return response.data; // Contiene el nuevo access_token
        } catch (error) {
            console.error('Error refreshing access token:', error.response?.data || error.message);
            throw new HttpException('Error refreshing access token', HttpStatus.BAD_REQUEST);
        }
    }

    // Método para reproducir una canción
    async playTrack(accessToken: string, deviceId: string, trackUri: string): Promise<void> {
        const playUrl = `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`;

        try {
            await firstValueFrom(
                this.httpService.put(
                    playUrl,
                    {
                        uris: [trackUri],
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            );
        } catch (error) {
            console.error('Error playing track:', error.response?.data || error.message);
            throw new HttpException('Error playing track', HttpStatus.BAD_REQUEST);
        }
    }

    // Método para obtener dispositivos disponibles
    async getAvailableDevices(accessToken: string): Promise<any> {
        const devicesUrl = 'https://api.spotify.com/v1/me/player/devices';

        try {
            const response = await firstValueFrom(
                this.httpService.get(devicesUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }),
            );
            return response.data.devices; // Retorna la lista de dispositivos
        } catch (error) {
            console.error('Error getting devices:', error.response?.data || error.message);
            throw new HttpException('Error getting devices', HttpStatus.BAD_REQUEST);
        }
    }

    // Método para buscar canciones en Spotify utilizando el access_token del usuario
    async searchTracks(query: string, accessToken: string): Promise<any> {
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(searchUrl, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }),
            );

            // Procesar los resultados para extraer sólo los campos necesarios
            const tracks = response.data.tracks.items.map((track) => ({
                name: track.name,
                artist: track.artists[0].name,
                albumImage: track.album.images[0]?.url || null,
                uri: track.uri, // Aquí incluimos el campo 'uri'
            }));

            return tracks; // Retornamos sólo los campos procesados
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Error searching tracks on Spotify';
            console.error('Error searching tracks on Spotify:', errorMessage);
            throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }
}
