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
        // Obtén las claves de cliente desde el archivo .env o configuración
        this.clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
    }

    // Función para obtener el token de acceso de Spotify
    private async getAccessToken(): Promise<string> {
        const tokenUrl = 'https://accounts.spotify.com/api/token';
        const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const data = 'grant_type=client_credentials';

        try {
            const response = await firstValueFrom(
                this.httpService.post(tokenUrl, data, {
                    headers: {
                        Authorization: `Basic ${authHeader}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Error obtaining Spotify token:', error.response?.data || error.message);
            throw new HttpException('Error obtaining Spotify token', HttpStatus.BAD_REQUEST);
        }
    }

    // Función para buscar canciones en Spotify
    async searchTracks(query: string): Promise<any> {
        const token = await this.getAccessToken(); // Asegúrate de tener un token válido
        const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

        try {
            const response = await firstValueFrom(
                this.httpService.get(searchUrl, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
            );
            return response.data.tracks.items; // Retorna solo los items de la búsqueda
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Error searching tracks on Spotify';
            console.error('Error searching tracks on Spotify:', errorMessage);
            throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST);
        }
    }
}