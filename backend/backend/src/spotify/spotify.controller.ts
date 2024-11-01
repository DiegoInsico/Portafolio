// spotify.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  // Ruta para buscar canciones en Spotify
  @Get('search')
  async search(@Query('query') query: string) {
    return this.spotifyService.searchTracks(query);
  }
}